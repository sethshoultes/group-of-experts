# Next.js MVP Architecture - Group of Experts System

## Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── discussion/
│   │   │   ├── create/route.ts
│   │   │   ├── message/route.ts
│   │   │   └── summary/route.ts
│   │   ├── experts/
│   │   │   ├── list/route.ts
│   │   │   └── profile/route.ts
│   │   └── auth/[...nextauth]/route.ts
│   ├── discussion/
│   │   ├── [id]/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   └── new/
│   │       └── page.tsx
│   ├── experts/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── discussion/
│   │   ├── DiscussionCanvas.tsx
│   │   ├── ExpertMessage.tsx
│   │   ├── ModeratorControls.tsx
│   │   └── SummaryView.tsx
│   ├── experts/
│   │   ├── ExpertCard.tsx
│   │   ├── ExpertList.tsx
│   │   └── ExpertSelector.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── lib/
│   ├── ai/
│   │   ├── claude.ts
│   │   ├── context.ts
│   │   └── prompt.ts
│   ├── db/
│   │   ├── schema.ts
│   │   └── client.ts
│   └── utils/
│       ├── experts.ts
│       └── discussion.ts
├── types/
│   ├── experts.ts
│   ├── discussion.ts
│   └── common.ts
└── config/
    ├── experts.ts
    └── prompts.ts
```

## Key Type Definitions

```typescript
// types/experts.ts
export interface Expert {
  id: string;
  name: string;
  role: ExpertRole;
  expertise: string[];
  promptTemplate: string;
  systemContext: string;
}

export interface Discussion {
  id: string;
  topic: string;
  status: DiscussionStatus;
  participants: Expert[];
  messages: Message[];
  summary?: Summary;
}

export interface Message {
  id: string;
  expertId: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  referencedMessages?: string[];
}

// types/common.ts
export enum DiscussionStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  SUMMARIZING = 'summarizing',
  COMPLETED = 'completed'
}

export enum MessageType {
  QUESTION = 'question',
  RESPONSE = 'response',
  CLARIFICATION = 'clarification',
  SUMMARY = 'summary'
}
```

## Database Schema (Prisma)

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

## AI Integration

```typescript
// lib/ai/claude.ts
import { AnthropicAPI } from '@anthropic-ai/sdk';

export class ClaudeManager {
  private client: AnthropicAPI;
  private context: DiscussionContext;

  constructor(apiKey: string) {
    this.client = new AnthropicAPI({
      apiKey,
      maxRetries: 3,
    });
  }

  async getExpertResponse(
    expert: Expert,
    discussion: Discussion,
    prompt: string
  ): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: this.buildSystemPrompt(expert, discussion)
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await this.client.messages.create({
      model: 'claude-3-sonnet-20240229',
      messages,
      max_tokens: 2000,
    });

    return response.content[0].text;
  }

  private buildSystemPrompt(expert: Expert, discussion: Discussion): string {
    return `
      ${expert.systemContext}
      Discussion Topic: ${discussion.topic}
      Current Participants: ${discussion.participants.map(p => p.name).join(', ')}
      Your Role: ${expert.role}
      Expertise Areas: ${expert.expertise.join(', ')}
    `;
  }
}
```

## State Management

```typescript
// lib/context/DiscussionContext.tsx
import { createContext, useContext, useReducer } from 'react';

interface DiscussionState {
  currentDiscussion: Discussion | null;
  activeExperts: Expert[];
  messages: Message[];
  status: DiscussionStatus;
}

const DiscussionContext = createContext<{
  state: DiscussionState;
  dispatch: React.Dispatch<DiscussionAction>;
}>({
  state: {
    currentDiscussion: null,
    activeExperts: [],
    messages: [],
    status: DiscussionStatus.PLANNING,
  },
  dispatch: () => null,
});

export const useDiscussion = () => useContext(DiscussionContext);

export const DiscussionProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(discussionReducer, initialState);

  return (
    <DiscussionContext.Provider value={{ state, dispatch }}>
      {children}
    </DiscussionContext.Provider>
  );
};
```

## WebSocket Integration

```typescript
// lib/websocket/socket.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
});

export const connectToDiscussion = (discussionId: string) => {
  socket.connect();
  socket.emit('join_discussion', { discussionId });
};

export const subscribeToMessages = (
  callback: (message: Message) => void
) => {
  socket.on('new_message', callback);
};
```
