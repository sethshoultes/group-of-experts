# Multi-Expert Discussion System - Technical Specification

## Overview
Enable users to create discussions where multiple AI experts can interact and provide perspectives on a topic, creating a rich, collaborative dialogue between different areas of expertise.

## Core Features

### 1. Discussion Creation
- Select multiple experts (2-3) for the discussion
- Specify discussion topic and description
- Set discussion mode (sequential or parallel responses)
- Optional focus areas or specific questions for each expert

### 2. Expert Interaction Flow
- Sequential Mode:
  - Experts respond in a defined order
  - Each expert can reference previous experts' points
  - Complete round before user can respond
  - Clear visual indication of current speaking expert

- Parallel Mode:
  - All selected experts provide responses simultaneously
  - Responses shown side by side for comparison
  - Experts can reference each other in follow-up rounds

### 3. Message Threading
- Clear visual separation between experts
- Expert-specific styling and icons
- Reference indicators for cross-expert mentions
- Collapsible message threads
- Round-based organization

## Technical Implementation

### 1. Database Schema

```sql
-- Add support for multiple experts per discussion
ALTER TABLE discussions
ADD COLUMN expert_ids text[] NOT NULL DEFAULT '{}',
ADD COLUMN discussion_mode text NOT NULL DEFAULT 'sequential'
CHECK (discussion_mode IN ('sequential', 'parallel')),
ADD COLUMN current_round integer NOT NULL DEFAULT 1;

-- Add reference tracking for messages
ALTER TABLE messages
ADD COLUMN round integer NOT NULL DEFAULT 1,
ADD COLUMN references jsonb DEFAULT '[]',
ADD COLUMN response_order integer;
```

### 2. Types

```typescript
interface MultiExpertDiscussion extends Discussion {
  expertIds: string[];
  discussionMode: 'sequential' | 'parallel';
  currentRound: number;
}

interface ExpertMessage extends Message {
  round: number;
  references: Array<{
    messageId: string;
    expertId: string;
    quote: string;
  }>;
  responseOrder?: number;
}
```

### 3. API Endpoints

```typescript
// Discussion Management
POST /api/discussions/multi
  - Create multi-expert discussion
  - Body: { topic, description, expertIds, mode }

PATCH /api/discussions/:id/round
  - Advance to next round
  - Body: { round: number }

// Message Management
POST /api/discussions/:id/messages/expert
  - Add expert message with references
  - Body: { expertId, content, references, round }

GET /api/discussions/:id/round/:round
  - Get messages for specific round
```

### 4. Expert Response Generation

```typescript
interface ExpertContext {
  discussionId: string;
  round: number;
  expertId: string;
  userMessage: string;
  otherExperts: Array<{
    expertId: string;
    name: string;
    role: string;
  }>;
  previousResponses: Array<{
    expertId: string;
    content: string;
    round: number;
  }>;
}

async function generateExpertResponse(context: ExpertContext): Promise<ExpertResponse> {
  const expert = expertRoles.find(e => e.id === context.expertId);
  
  // Build prompt with context about other experts
  const prompt = `
    ${expert.systemPrompt}
    
    You are participating in a multi-expert discussion with:
    ${context.otherExperts.map(e => `- ${e.name} (${e.role})`).join('\n')}
    
    Current discussion topic: ${context.userMessage}
    
    Previous expert responses:
    ${context.previousResponses.map(r => {
      const respExpert = context.otherExperts.find(e => e.expertId === r.expertId);
      return `${respExpert?.name}: ${r.content}`;
    }).join('\n\n')}
    
    Please provide your perspective, considering:
    1. Your specific expertise
    2. How it complements other experts' views
    3. Any agreements or constructive disagreements with other experts
    4. Practical recommendations based on the combined expertise
  `;
  
  // Generate response using OpenAI
  const response = await getAIResponse(prompt);
  
  return {
    role: expert.id,
    content: response,
    references: extractReferences(response, context.previousResponses)
  };
}
```

### 5. UI Components

#### Discussion Creation
```typescript
interface MultiExpertCreationProps {
  onSubmit: (data: {
    topic: string;
    description: string;
    expertIds: string[];
    mode: 'sequential' | 'parallel';
  }) => Promise<void>;
}

function MultiExpertCreation({ onSubmit }: MultiExpertCreationProps) {
  // Implementation details in separate UI spec
}
```

#### Expert Response Panel
```typescript
interface ExpertResponsePanelProps {
  discussion: MultiExpertDiscussion;
  currentRound: number;
  activeExpert: string;
  onExpertResponse: (response: ExpertResponse) => Promise<void>;
}

function ExpertResponsePanel({ discussion, currentRound, activeExpert, onExpertResponse }: ExpertResponsePanelProps) {
  // Implementation details in separate UI spec
}
```

## Security Considerations

1. Rate Limiting
   - Per-discussion limits
   - Round-based cooldowns
   - Maximum experts per discussion

2. Content Validation
   - Expert response length limits
   - Reference validation
   - Round number validation

3. Access Control
   - Discussion owner permissions
   - Expert selection validation
   - Round progression rules

## Performance Optimization

1. Response Caching
   - Cache expert responses per round
   - Cache reference lookups
   - Invalidate on round change

2. Lazy Loading
   - Load rounds on demand
   - Paginate long discussions
   - Defer expert profile loading

3. UI Optimization
   - Virtualized message list
   - Optimistic updates
   - Progressive loading indicators

## Success Metrics

1. User Engagement
   - Average experts per discussion
   - Response quality ratings
   - Discussion completion rates

2. Performance
   - Response generation time
   - Round transition latency
   - UI responsiveness

3. Quality
   - Expert interaction rate
   - Reference accuracy
   - User satisfaction scores

## Next Steps

1. Database Migration
   - Create new schema changes
   - Update existing discussions
   - Add indexes for performance

2. API Implementation
   - Expert response generation
   - Round management
   - Reference handling

3. UI Development
   - Expert selection interface
   - Response threading
   - Reference visualization

4. Testing
   - Expert interaction flows
   - Round progression
   - Performance benchmarks