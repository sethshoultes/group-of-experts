# Group of Experts AI System

## Project Overview
A Next.js-based application that facilitates moderated discussions between AI expert personas for product development and decision-making.

## Technical Stack
- Framework: Next.js 14+ (App Router)
- Language: TypeScript 5.0+
- UI: React, TailwindCSS, shadcn/ui
- Database: PostgreSQL with Prisma ORM
- AI: Anthropic Claude API
- Real-time: WebSocket (Socket.io)
- Deployment: Vercel
- State Management: React Context + Reducers

## Core Features

### 1. Expert System
- Configurable expert profiles with specific domains
- Dynamic expert selection based on discussion needs
- Expert personality and knowledge persistence
- Response quality monitoring

### 2. Discussion Management
- Real-time discussion updates
- Message threading and context awareness
- Moderator controls and intervention
- Discussion summarization and export

### 3. AI Integration
- Claude API integration for expert responses
- Context management across messages
- Prompt engineering for expert personalities
- Response validation and quality control

## Technical Specifications

### Database Schema
```prisma
model Expert {
  id          String      @id @default(cuid())
  name        String
  role        String
  expertise   String[]
  prompts     Json
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  discussions Discussion[]
}

model Discussion {
  id          String     @id @default(cuid())
  topic       String
  status      String
  messages    Message[]
  experts     Expert[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Message {
  id          String     @id @default(cuid())
  content     String
  type        String
  expertId    String
  discussionId String
  discussion  Discussion @relation(fields: [discussionId], references: [id])
  references  String[]
  createdAt   DateTime   @default(now())
}
```

### Type Definitions
```typescript
interface Expert {
  id: string;
  name: string;
  role: ExpertRole;
  expertise: string[];
  promptTemplate: string;
  systemContext: string;
}

interface Discussion {
  id: string;
  topic: string;
  status: DiscussionStatus;
  participants: Expert[];
  messages: Message[];
  summary?: Summary;
}

interface Message {
  id: string;
  expertId: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  referencedMessages?: string[];
}

enum DiscussionStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  SUMMARIZING = 'summarizing',
  COMPLETED = 'completed'
}
```

### API Routes

```typescript
// API Route Structure
/api/
  /discussion/
    - POST /create - Create new discussion
    - POST /message - Add message to discussion
    - GET /[id] - Get discussion details
    - PUT /[id]/status - Update discussion status
  /experts/
    - GET /list - List available experts
    - GET /[id] - Get expert details
    - POST /select - Select experts for discussion
```

### Component Structure
```
components/
  /discussion/
    - DiscussionCanvas.tsx
    - ExpertMessage.tsx
    - ModeratorControls.tsx
    - SummaryView.tsx
  /experts/
    - ExpertCard.tsx
    - ExpertList.tsx
    - ExpertSelector.tsx
  /ui/
    - Button.tsx
    - Card.tsx
    - Input.tsx
```

## Implementation Guidelines

### 1. Expert Profile Creation
```typescript
// Example expert profile structure
const expertProfile = {
  name: "Technical Architect",
  role: "TECHNICAL",
  expertise: ["system_design", "scalability", "security"],
  systemContext: `You are an experienced technical architect with expertise in 
    system design, scalability, and security. Your responses should focus on 
    technical feasibility, best practices, and potential technical challenges.`,
  promptTemplate: `Given the context: {context}
    And the current discussion topic: {topic}
    Please provide your technical perspective on: {question}`
};
```

### 2. Discussion Flow
1. User creates new discussion topic
2. System selects relevant experts
3. Moderator initiates discussion
4. Experts provide responses in turns
5. Moderator guides conversation
6. System generates summary
7. Discussion archived

### 3. AI Integration
```typescript
// Example Claude API integration
async function getExpertResponse(
  expert: Expert,
  discussion: Discussion,
  prompt: string
): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: expert.systemContext
    },
    {
      role: 'user',
      content: buildPrompt(expert.promptTemplate, {
        context: discussion.context,
        topic: discussion.topic,
        question: prompt
      })
    }
  ];

  return await claude.complete(messages);
}
```

## Development Phases

### Phase 1: Foundation (2 weeks)
- Basic Next.js setup
- Database implementation
- Expert profile system
- Simple discussion flow

### Phase 2: AI Integration (2 weeks)
- Claude API integration
- Expert response generation
- Context management
- Basic moderation

### Phase 3: Real-time Features (2 weeks)
- WebSocket implementation
- Live discussion updates
- Enhanced moderation
- Discussion state management

### Phase 4: Enhancement (2 weeks)
- Discussion summarization
- Export functionality
- Analytics
- Performance optimization

## Deployment Guidelines

### Vercel Deployment
```bash
# Build command
next build

# Environment variables
DATABASE_URL=
CLAUDE_API_KEY=
WEBSOCKET_URL=
NEXTAUTH_SECRET=
```

### Database Migration
```bash
# Initialize Prisma
npx prisma init

# Generate migration
npx prisma migrate dev

# Apply migration
npx prisma migrate deploy
```

## Testing Strategy

### Unit Tests
- Expert profile validation
- Discussion flow logic
- Message threading
- AI response processing

### Integration Tests
- Expert selection system
- Discussion creation flow
- Real-time updates
- Summary generation

### E2E Tests
- Complete discussion flow
- Expert interaction patterns
- Moderation controls
- Export functionality

## Monitoring and Analytics

### Key Metrics
- Response generation time
- Discussion completion rate
- Expert utilization
- User engagement

### Error Tracking
- AI response failures
- WebSocket disconnections
- Database errors
- API failures

## Security Considerations

### API Security
- Rate limiting
- Request validation
- API key rotation
- Error handling

### Data Protection
- Message encryption
- Expert profile security
- Discussion privacy
- User data handling

## Future Enhancements

### Phase 5+
- Multiple AI model support
- Custom expert creation
- Advanced analytics
- API for external integration
- Mobile optimization
