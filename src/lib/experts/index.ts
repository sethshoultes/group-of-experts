import { expertRoles } from './roles';
import { supabase } from '../supabase';
import type { ExpertRole } from './roles';

export interface ExpertResponse {
  role: string;
  content: string;
}

export async function getAvailableExperts(): Promise<ExpertRole[]> {
  // Get user's active API keys
  const { data: apiKeys, error: apiKeyError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('is_active', true);

  if (apiKeyError) throw apiKeyError;

  // If no active API keys, return empty list
  if (!apiKeys || apiKeys.length === 0) {
    return [];
  }

  // Return all expert roles if user has at least one active API key
  return expertRoles;
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
    let response;
    
    if (apiKey.provider === 'claude') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.key,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          messages: [
            {
              role: 'system',
              content: expert.systemPrompt
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 1000
        })
      });
    } else {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: expert.systemPrompt
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 1000
        })
      });
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get expert response');
    }

    const data = await response.json();
    const content = apiKey.provider === 'claude' 
      ? data.content[0].text
      : data.choices[0].message.content;

    // Update last_used timestamp for the API key
    await supabase
      .from('api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('id', apiKey.id);

    return {
      role: expert.id,
      content
    };
  } catch (error) {
    throw new Error(`Failed to get expert response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}