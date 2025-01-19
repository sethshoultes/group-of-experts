import { supabase } from './supabase';
import type { Discussion } from '../types';

export async function getDiscussions(): Promise<Discussion[]> {
  const { data, error } = await supabase
    .from('discussions')
    .select(`
      *,
      messages:messages(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(discussion => ({
    ...discussion,
    createdAt: new Date(discussion.created_at),
    updatedAt: new Date(discussion.updated_at),
    messages: discussion.messages.map((message: any) => ({
      ...message,
      timestamp: new Date(message.created_at)
    }))
  }));
}

export async function getDiscussion(id: string): Promise<Discussion> {
  const { data, error } = await supabase
    .from('discussions')
    .select(`
      *,
      messages:messages(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  return {
    ...data,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    messages: data.messages.map((message: any) => ({
      ...message,
      timestamp: new Date(message.created_at)
    }))
  };
}

export async function createDiscussion(topic: string, description: string): Promise<Discussion> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('discussions')
    .insert({
      user_id: user.id,
      topic,
      description,
      status: 'active'
    })
    .select(`
      *,
      messages:messages(*)
    `)
    .single();

  if (error) throw error;

  return {
    ...data,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    messages: []
  };
}

export async function updateDiscussionStatus(id: string, status: 'active' | 'completed'): Promise<void> {
  const { error } = await supabase
    .from('discussions')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function addMessage(
  discussionId: string,
  expertRole: string,
  content: string
): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .insert({
      discussion_id: discussionId,
      expert_role: expertRole,
      content
    });

  if (error) throw error;
}