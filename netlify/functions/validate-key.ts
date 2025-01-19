import { Handler } from '@netlify/functions';

const validateClaudeKey = async (key: string) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'claude-3-haiku-20240307',
        max_tokens: 1
      })
    });

    if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' };
    }
    
    if (!response.ok) {
      const data = await response.json();
      return { valid: false, error: data.error?.message || 'Validation failed' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Network error during validation' };
  }
};

const validateOpenAIKey = async (key: string) => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${key}`
      }
    });

    if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' };
    }

    if (!response.ok) {
      const data = await response.json();
      return { valid: false, error: data.error?.message || 'Validation failed' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Network error during validation' };
  }
};

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { provider, key } = JSON.parse(event.body || '{}');

    // Validate input
    if (!provider || !key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Provider and key are required' })
      };
    }

    if (!['claude', 'openai'].includes(provider)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid provider' })
      };
    }

    // Validate the key
    const result = await (provider === 'claude' ? validateClaudeKey(key) : validateOpenAIKey(key));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};