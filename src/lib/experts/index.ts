import { expertRoles } from './roles';
import { supabase } from '../supabase';
import { apiDebugger } from '../api';
import { processExpertInteraction } from './interactions';
import type { Message, Discussion } from '../types';
import type { ExpertRole } from './roles';

interface FormattedMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ExpertResponse {
  role: string;
  content: string;
  references: Array<{
    messageId: string;
    expertId: string;
    quote: string;
  }>;
  metadata: {
    confidence: number;
    agreementLevel: number;
    contributionType: 'primary' | 'supporting' | 'alternative';
  };
}

const MAX_CONTEXT_MESSAGES = 5;

async function getDiscussionContext(discussionId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('discussion_id', discussionId)
    .order('created_at', { ascending: false })
    .limit(MAX_CONTEXT_MESSAGES);

  if (error) throw error;
  return data.reverse();
}

function formatContextMessages(messages: Message[], expert: ExpertRole): FormattedMessage[] {
  // Add system prompt as the first message
  const formattedMessages: FormattedMessage[] = [{
    role: 'assistant',
    content: expert.systemPrompt
  }];

  // Add conversation history
  messages.forEach(msg => formattedMessages.push({
    role: msg.expert_role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));

  return formattedMessages;
}

export async function getAvailableExperts(): Promise<ExpertRole[]> {
  console.log('Fetching available experts...');

  // Get user's active API keys
  const { data: apiKeys, error: apiKeyError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('is_active', true);

  if (apiKeyError) {
    console.error('Error fetching API keys:', apiKeyError);
    throw apiKeyError;
  }

  console.log('Found API keys:', apiKeys?.length || 0);

  // If no active API keys, return empty list
  if (!apiKeys || apiKeys.length === 0) {
    console.log('No active API keys found');
    return [];
  }

  console.log('Returning expert roles');
  return expertRoles;
}

async function generateExpertPrompt(
  expert: ExpertRole,
  userMessage: string,
  context: {
    previousMessages: Message[];
    otherExperts: ExpertRole[];
  }
): Promise<string> {
  const { previousMessages, otherExperts } = context;
  
  return `
${expert.systemPrompt}

You are participating in a technical discussion with other experts:
${otherExperts
  .map(e => `- ${e.name} (${e.expertise.join(', ')})`)
  .join('\n')}

Current discussion topic: ${userMessage}

Previous messages:
${previousMessages
  .map(msg => {
    const msgExpert = expertRoles.find(e => e.id === msg.expert_role);
    return msgExpert 
      ? `${msgExpert.name}: ${msg.content}`
      : `User: ${msg.content}`;
  })
  .join('\n\n')}

Please provide your expert perspective, considering:
1. Your specific expertise domain
2. How your knowledge complements other experts
3. Areas of agreement or constructive disagreement
4. Practical recommendations
5. Clear references to other experts' points when relevant
`;
}

export async function getExpertResponse(
  discussionId: string,
  expertId: string,
  userMessage: string
): Promise<ExpertResponse> {
  // Get the expert role
  const expert = expertRoles.find(role => role.id === expertId);
  if (!expert) {
    throw new Error('Expert not found');
  }

  // Get previous messages for context
  const contextMessages = await getDiscussionContext(discussionId);
  
  // Get discussion details
  const { data: discussion, error: discussionError } = await supabase
    .from('discussions')
    .select('expert_ids, discussion_mode, current_round, metadata')
    .eq('id', discussionId)
    .single();

  if (discussionError || !discussion) throw new Error('Discussion not found');
  
  const otherExperts = expertRoles.filter(
    e => discussion.expert_ids.includes(e.id) && e.id !== expertId
  );

  // Get messages from current round
  const { data: roundMessages, error: roundError } = await supabase
    .from('messages')
    .select('*')
    .eq('discussion_id', discussionId)
    .eq('round', discussion.current_round)
    .order('response_order', { ascending: true });

  if (roundError) throw roundError;

  // Get user's active API key
  const { data: apiKeys, error: apiKeyError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('is_active', true)
    .limit(1);

  if (apiKeyError) throw apiKeyError;
  if (!apiKeys || apiKeys.length === 0) {
    throw new Error('No active API key found');
  }

  const apiKey = apiKeys[0];

  try {
    const prompt = await generateExpertPrompt(expert, userMessage, {
      previousMessages: contextMessages,
      otherExperts: otherExperts || []
    });

    const response = await apiDebugger.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.key}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get expert response');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const references = extractReferences(content, contextMessages);
    const metadata = {
      confidence: calculateConfidence(content),
      agreementLevel: calculateAgreementLevel(content),
      contributionType: determineContributionType(content)
    };

    // Update last_used timestamp for the API key
    await supabase
      .from('api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('id', apiKey.id);

    return {
      role: expert.id,
      content,
      references,
      metadata
    };
  } catch (error) {
    throw new Error(`Failed to get expert response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function calculateConfidence(content: string): number {
  const hasTechnicalDetails = /\b(specifically|technically|in detail)\b/i.test(content) ? 0.3 : 0;
  const hasUncertainty = /\b(might|maybe|perhaps|possibly)\b/i.test(content) ? -0.2 : 0;
  return Math.min(1, Math.max(0, 0.7 + hasTechnicalDetails + hasUncertainty));
}

function calculateAgreementLevel(content: string): number {
  const agreementPhrases = /\b(agree|concur|support|correct|right)\b/i;
  const disagreementPhrases = /\b(disagree|differ|contrary|however|but)\b/i;
  
  const agreementCount = (content.match(agreementPhrases) || []).length;
  const disagreementCount = (content.match(disagreementPhrases) || []).length;
  
  return Math.min(1, Math.max(0, 0.5 + (agreementCount * 0.2) - (disagreementCount * 0.2)));
}

function determineContributionType(content: string): 'primary' | 'supporting' | 'alternative' {
  const hasAlternative = /\b(alternatively|different approach|another way|instead)\b/i.test(content);
  const hasSupport = /\b(additionally|furthermore|moreover|building on)\b/i.test(content);
  
  if (hasAlternative) return 'alternative';
  if (hasSupport) return 'supporting';
  return 'primary';
}

function extractReferences(content: string, previousMessages: Message[]): Array<{
  messageId: string;
  expertId: string;
  quote: string;
}> {
  const references: Array<{
    messageId: string;
    expertId: string;
    quote: string;
  }> = [];

  previousMessages.forEach(msg => {
    const quotes = findQuotes(content, msg.content);
    quotes.forEach(quote => {
      references.push({
        messageId: msg.id,
        expertId: msg.expert_role,
        quote
      });
    });
  });

  return references;
}

function findQuotes(content: string, sourceText: string): string[] {
  const quotes: string[] = [];
  const minQuoteLength = 10;
  
  // Find substantial matching text segments
  const words = sourceText.split(' ');
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 2; j < words.length; j++) {
      const phrase = words.slice(i, j).join(' ');
      if (phrase.length >= minQuoteLength && content.includes(phrase)) {
        quotes.push(phrase);
        i = j; // Skip ahead
        break;
      }
    }
  }
  
  return quotes;
}