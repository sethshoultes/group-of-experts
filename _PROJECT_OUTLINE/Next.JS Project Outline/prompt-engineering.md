# Prompt Engineering System

## Base Expert Templates

```typescript
interface PromptTemplate {
  systemContext: string;
  messageTemplate: string;
  responseFormat: string;
  constraints: string[];
}

const expertTemplates: Record<ExpertRole, PromptTemplate> = {
  TECHNICAL_ARCHITECT: {
    systemContext: `You are a senior technical architect with 15+ years of experience in system design and architecture. 
    Approach: Analytical, pragmatic, security-conscious
    Communication style: Clear, technical but accessible
    Key considerations: Scalability, maintainability, security`,
    
    messageTemplate: `Context: {context}
    Previous discussion: {discussion_summary}
    Current topic: {topic}
    Question/Point to address: {message_content}
    
    Provide your architectural perspective, considering:
    1. Technical feasibility
    2. Potential challenges
    3. Best practices
    4. Implementation recommendations`,
    
    responseFormat: `Response structure:
    - Technical Analysis
    - Key Considerations
    - Recommendations
    - Risks/Tradeoffs`,
    
    constraints: [
      "Focus on technical accuracy",
      "Highlight security implications",
      "Consider scale requirements",
      "Reference industry standards"
    ]
  },

  PRODUCT_STRATEGIST: {
    systemContext: `You are a product strategy expert with experience in market analysis and product development.
    Approach: Market-driven, user-centric, strategic
    Communication style: Business-focused, evidence-based
    Key considerations: Market fit, user needs, business value`,

    messageTemplate: `Market context: {market_context}
    User segment: {user_segment}
    Business goals: {business_goals}
    Discussion point: {message_content}
    
    Analyze from product strategy perspective:
    1. Market opportunity
    2. User value proposition
    3. Business model implications
    4. Go-to-market considerations`,

    responseFormat: `Response structure:
    - Strategic Analysis
    - Market Insights
    - Value Proposition
    - Next Steps`,

    constraints: [
      "Focus on market viability",
      "Consider competitive landscape",
      "Address user needs",
      "Link to business goals"
    ]
  }
};
```

## Prompt Generation System

```typescript
// lib/ai/prompt.ts
export function buildPrompt({
  expert,
  discussion,
  messageContent,
  previousMessages
}: PromptInput): string {
  const template = expertTemplates[expert.role];
  
  const context = buildContext(discussion, previousMessages);
  const discussionSummary = summarizeDiscussion(previousMessages);
  
  return formatPrompt(template, {
    context,
    discussion_summary: discussionSummary,
    topic: discussion.topic,
    message_content: messageContent,
    market_context: getMarketContext(discussion),
    user_segment: getUserSegment(discussion),
    business_goals: getBusinessGoals(discussion)
  });
}

function buildContext(
  discussion: Discussion,
  messages: Message[]
): string {
  return `
    Topic: ${discussion.topic}
    Stage: ${discussion.status}
    Key Points Discussed:
    ${extractKeyPoints(messages)}
    Current Focus:
    ${determineCurrentFocus(messages)}
    Open Questions:
    ${identifyOpenQuestions(messages)}
  `;
}

function formatPrompt(
  template: PromptTemplate,
  variables: Record<string, string>
): string {
  let prompt = `${template.systemContext}\n\n`;
  prompt += interpolateTemplate(template.messageTemplate, variables);
  prompt += `\n\n${template.responseFormat}`;
  prompt += `\n\nConstraints:\n${template.constraints.join('\n')}`;
  
  return prompt;
}
```

## Response Processing

```typescript
// lib/ai/response.ts
export async function processExpertResponse(
  response: string,
  expert: Expert,
  discussion: Discussion
): Promise<ProcessedResponse> {
  // Validate response format
  const validationResult = validateResponseFormat(
    response,
    expertTemplates[expert.role].responseFormat
  );

  if (!validationResult.isValid) {
    return await regenerateResponse(expert, discussion);
  }

  // Extract key points
  const keyPoints = extractKeyPoints(response);

  // Check for constraint adherence
  const constraintCheck = checkConstraints(
    response,
    expertTemplates[expert.role].constraints
  );

  if (!constraintCheck.passedAll) {
    return await refineResponse(response, constraintCheck.failedConstraints);
  }

  // Format final response
  return {
    content: response,
    keyPoints,
    metadata: {
      format: validationResult,
      constraints: constraintCheck,
      extractedInsights: keyPoints
    }
  };
}
```

## Quality Monitoring

```typescript
// lib/ai/quality.ts
export function monitorResponseQuality(
  response: ProcessedResponse,
  expert: Expert
): QualityMetrics {
  return {
    formatAdherence: calculateFormatAdherence(
      response,
      expertTemplates[expert.role].responseFormat
    ),
    constraintCompliance: calculateConstraintCompliance(
      response,
      expertTemplates[expert.role].constraints
    ),
    expertiseLevel: assessExpertiseLevel(
      response,
      expert.expertise
    ),
    coherence: assessCoherence(response),
    usefulness: assessUsefulness(response)
  };
}
```
