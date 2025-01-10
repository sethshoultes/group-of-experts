# API Implementation

## Core API Routes

### 1. Discussion Management

```typescript
// app/api/discussion/create/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { selectExperts } from '@/lib/experts';

export async function POST(req: Request) {
  const { topic, expertCount = 3 } = await req.json();
  
  const selectedExperts = await selectExperts(topic, expertCount);
  
  const discussion = await prisma.discussion.create({
    data: {
      topic,
      status: 'PLANNING',
      experts: {
        connect: selectedExperts.map(e => ({ id: e.id }))
      }
    },
    include: {
      experts: true
    }
  });
  
  return NextResponse.json({ discussion });
}

// app/api/discussion/message/route.ts
import { claude } from '@/lib/ai/claude';
import { buildPrompt } from '@/lib/ai/prompt';

export async function POST(req: Request) {
  const { discussionId, expertId, messageContent } = await req.json();
  
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    include: { 
      messages: true,
      experts: true
    }
  });

  const expert = discussion.experts.find(e => e.id === expertId);
  
  const prompt = buildPrompt({
    expert,
    discussion,
    messageContent,
    previousMessages: discussion.messages
  });

  const aiResponse = await claude.getExpertResponse(expert, prompt);
  
  const message = await prisma.message.create({
    data: {
      content: aiResponse,
      expertId,
      discussionId,
      type: 'RESPONSE'
    }
  });

  return NextResponse.json({ message });
}

// app/api/discussion/[id]/summary/route.ts
export async function POST(req: Request) {
  const { id } = req.params;
  
  const discussion = await prisma.discussion.findUnique({
    where: { id },
    include: { messages: true }
  });

  const summaryPrompt = buildSummaryPrompt(discussion);
  const summary = await claude.generateSummary(summaryPrompt);

  await prisma.discussion.update({
    where: { id },
    data: { 
      status: 'COMPLETED',
      summary
    }
  });

  return NextResponse.json({ summary });
}
```

### 2. Expert Management

```typescript
// app/api/experts/select/route.ts
export async function POST(req: Request) {
  const { topic, requiredExpertise } = await req.json();
  
  const experts = await prisma.expert.findMany({
    where: {
      expertise: {
        hasEvery: requiredExpertise
      }
    }
  });

  const selectedExperts = selectOptimalExperts(experts, topic);
  
  return NextResponse.json({ experts: selectedExperts });
}

// lib/experts.ts
export function selectOptimalExperts(
  experts: Expert[], 
  topic: string
): Expert[] {
  // Score experts based on expertise match
  const scoredExperts = experts.map(expert => ({
    expert,
    score: calculateExpertiseMatch(expert, topic)
  }));

  // Select diverse set of experts
  return optimizeExpertSelection(scoredExperts);
}
```

### 3. Middleware & Error Handling

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(req: Request) {
  // Rate limiting
  const limiter = await rateLimit(req);
  if (!limiter.success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  // Request validation
  const validation = validateRequest(req);
  if (!validation.success) {
    return new NextResponse(validation.error, { status: 400 });
  }

  // Error handling
  try {
    const response = await NextResponse.next();
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

export const config = {
  matcher: '/api/:path*'
};
```
