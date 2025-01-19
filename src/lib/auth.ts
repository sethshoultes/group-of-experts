import { supabase } from './supabase';
import type { User, ApiKey } from '../types';

interface ValidationResponse {
  valid: boolean;
  error?: string;
}

async function validateClaudeKey(key: string): Promise<ValidationResponse> {
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
}

async function validateOpenAIKey(key: string): Promise<ValidationResponse> {
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
}

export async function validateApiKey(provider: 'claude' | 'openai', key: string): Promise<ValidationResponse> {
  if (!key.trim()) {
    return { valid: false, error: 'API key is required' };
  }

  // In production, use Netlify Functions
  if (import.meta.env.PROD) {
    try {
      const response = await fetch('/.netlify/functions/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider, key })
      });

      if (!response.ok) {
        const data = await response.json();
        return { valid: false, error: data.error || 'Validation failed' };
      }

      return await response.json();
    } catch (error) {
      return { valid: false, error: 'Network error during validation' };
    }
  }

  // In development, validate directly
  return provider === 'claude' ? validateClaudeKey(key) : validateOpenAIKey(key);
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getUserApiKeys(): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addApiKey(key: Omit<ApiKey, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'lastUsed'>) {
  // Validate the key before adding
  const validation = await validateApiKey(key.provider, key.key);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid API key');
  }

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      ...key,
      user_id: (await getCurrentUser())?.id,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateApiKey(id: string, updates: Partial<ApiKey>) {
  const { data, error } = await supabase
    .from('api_keys')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteApiKey(id: string) {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id);

  if (error) throw error;
}