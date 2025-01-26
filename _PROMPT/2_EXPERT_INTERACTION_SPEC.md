# Expert Interaction System - Technical Specification

## Overview
Enable rich interactions between experts within discussions, allowing them to reference, build upon, and constructively debate each other's points while maintaining a coherent conversation flow.

## Core Features

### 1. Message References
- Cross-reference previous expert messages
- Quote specific parts of messages
- Link related points across the discussion
- Visual indicators for referenced content

### 2. Expert Interaction Types
- Direct responses to specific points
- Collaborative elaboration
- Constructive counterpoints
- Synthesis of multiple viewpoints

### 3. Message Threading
- Hierarchical message organization
- Visual connection between related messages
- Collapsible thread groups
- Clear parent-child relationships

## Technical Implementation

### 1. Database Schema Updates

```sql
-- Add reference tracking to messages
ALTER TABLE messages
ADD COLUMN reference_id uuid REFERENCES messages(id),
ADD COLUMN reference_type text CHECK (reference_type IN ('reply', 'quote', 'mention')),
ADD COLUMN reference_context jsonb DEFAULT '{}';

-- Add message metadata
ALTER TABLE messages
ADD COLUMN metadata jsonb DEFAULT '{}';

-- Add indexes for performance
CREATE INDEX idx_messages_reference_id ON messages(reference_id);
CREATE INDEX idx_messages_reference_type ON messages(reference_type);
```

### 2. Types

```typescript
interface MessageReference {
  messageId: string;
  type: 'reply' | 'quote' | 'mention';
  context: {
    quote?: string;
    highlightRange?: [number, number];
    summary?: string;
  };
}

interface ExpertMessage extends Message {
  references: MessageReference[];
  metadata: {
    interactionType?: 'elaborate' | 'counter' | 'synthesize';
    confidence?: number;
    sources?: string[];
    tags?: string[];
  };
}

interface MessageThread {
  id: string;
  parentId: string | null;
  messages: ExpertMessage[];
  childThreads: MessageThread[];
}
```

### 3. Expert Response Generation

```typescript
interface ExpertInteractionContext {
  discussionId: string;
  messageId: string;
  expertId: string;
  interactionType: 'elaborate' | 'counter' | 'synthesize';
  references: MessageReference[];
  previousContext: {
    messages: ExpertMessage[];
    experts: {
      id: string;
      name: string;
      expertise: string[];
    }[];
  };
}

async function generateExpertInteraction(
  context: ExpertInteractionContext
): Promise<ExpertMessage> {
  const expert = expertRoles.find(e => e.id === context.expertId);
  
  // Build interaction-specific prompt
  const prompt = `
    ${expert.systemPrompt}
    
    You are participating in a technical discussion with other experts:
    ${context.previousContext.experts
      .map(e => `- ${e.name} (${e.expertise.join(', ')})`)
      .join('\n')}
    
    Referenced messages:
    ${context.references
      .map(ref => {
        const msg = context.previousContext.messages
          .find(m => m.id === ref.messageId);
        return `${msg?.expertRole}: ${
          ref.type === 'quote' 
            ? ref.context.quote 
            : msg?.content
        }`;
      })
      .join('\n\n')}
    
    Interaction type: ${context.interactionType}
    
    ${getInteractionPrompt(context.interactionType)}
    
    Please provide your response, focusing on:
    1. Clear connection to referenced points
    2. Your unique expertise perspective
    3. Constructive interaction with other experts
    4. Practical insights and recommendations
  `;
  
  const response = await getAIResponse(prompt);
  
  return {
    ...response,
    references: context.references,
    metadata: {
      interactionType: context.interactionType,
      confidence: calculateConfidence(response),
      tags: extractTags(response)
    }
  };
}

function getInteractionPrompt(type: string): string {
  switch (type) {
    case 'elaborate':
      return 'Build upon and expand the referenced points, adding depth from your expertise';
    case 'counter':
      return 'Provide a constructive alternative perspective, supported by your expertise';
    case 'synthesize':
      return 'Combine and reconcile the different viewpoints into a cohesive recommendation';
    default:
      return '';
  }
}
```

### 4. Message Threading System

```typescript
class MessageThreadManager {
  private threads: Map<string, MessageThread> = new Map();
  
  constructor(messages: ExpertMessage[]) {
    this.buildThreads(messages);
  }
  
  private buildThreads(messages: ExpertMessage[]) {
    // Group messages by reference relationships
    messages.forEach(msg => {
      if (!msg.reference_id) {
        // Root level message
        this.threads.set(msg.id, {
          id: msg.id,
          parentId: null,
          messages: [msg],
          childThreads: []
        });
      } else {
        // Add to existing thread or create new branch
        this.addToThread(msg);
      }
    });
  }
  
  private addToThread(message: ExpertMessage) {
    const parentThread = this.findThreadByMessage(message.reference_id);
    if (parentThread) {
      if (message.reference_type === 'reply') {
        parentThread.messages.push(message);
      } else {
        // Create new branch for quotes and mentions
        const newThread: MessageThread = {
          id: message.id,
          parentId: parentThread.id,
          messages: [message],
          childThreads: []
        };
        parentThread.childThreads.push(newThread);
        this.threads.set(message.id, newThread);
      }
    }
  }
  
  public getThreadedMessages(): MessageThread[] {
    return Array.from(this.threads.values())
      .filter(thread => !thread.parentId);
  }
}
```

### 5. UI Components

#### Message Reference Selection
```typescript
interface ReferenceSelectionProps {
  messages: ExpertMessage[];
  onSelect: (reference: MessageReference) => void;
}

function ReferenceSelection({ messages, onSelect }: ReferenceSelectionProps) {
  // Implementation details in UI spec
}
```

#### Threaded Message Display
```typescript
interface ThreadedMessageProps {
  thread: MessageThread;
  onInteraction: (message: ExpertMessage, type: string) => void;
}

function ThreadedMessage({ thread, onInteraction }: ThreadedMessageProps) {
  // Implementation details in UI spec
}
```

## Security Considerations

1. Reference Validation
   - Verify message ownership
   - Validate reference types
   - Check reference permissions
   - Sanitize quoted content

2. Content Moderation
   - Expert response guidelines
   - Interaction tone monitoring
   - Content length limits
   - Reference count limits

3. Rate Limiting
   - Per-thread limits
   - Interaction cooldowns
   - Maximum reference depth

## Performance Optimization

1. Thread Management
   - Efficient thread building
   - Lazy thread loading
   - Thread cache management
   - Optimized reference lookups

2. UI Performance
   - Virtual thread rendering
   - Incremental loading
   - Efficient re-rendering
   - State management optimization

3. Response Generation
   - Context pruning
   - Reference batching
   - Response caching
   - Parallel processing

## Success Metrics

1. Interaction Quality
   - Reference relevance
   - Response coherence
   - Expert collaboration rate
   - User comprehension

2. System Performance
   - Thread building time
   - Reference lookup speed
   - UI responsiveness
   - Memory usage

3. User Experience
   - Thread navigation ease
   - Reference clarity
   - Interaction flow
   - Information accessibility

## Implementation Phases

### Phase 1: Core Infrastructure
1. Database schema updates
2. Basic message references
3. Simple threading system
4. Initial UI components

### Phase 2: Enhanced Interactions
1. Advanced reference types
2. Expert response generation
3. Thread visualization
4. Interaction UI

### Phase 3: Optimization
1. Performance improvements
2. UI refinements
3. Caching system
4. Monitoring tools

### Phase 4: Advanced Features
1. Complex threading
2. Rich references
3. Expert collaboration tools
4. Analytics system

## Next Steps

1. Database Migration
   - Create schema updates
   - Add indexes
   - Update existing data

2. Core Implementation
   - Message reference system
   - Threading logic
   - Basic UI components

3. Testing Strategy
   - Reference validation
   - Threading accuracy
   - Performance benchmarks
   - UI testing

4. Documentation
   - API documentation
   - UI guidelines
   - Performance recommendations
   - Best practices