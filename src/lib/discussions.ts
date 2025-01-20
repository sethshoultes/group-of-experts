import { supabase } from './supabase';
import type { Discussion } from '../types';

export async function getDiscussions(): Promise<Discussion[]> {
  const { data, error } = await supabase
    .from('discussions')
    .select(`
      *,
      messages:messages(*)
    `);

  if (error) throw error;
  return data.map(discussion => ({
    ...discussion,
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

export async function deleteDiscussion(id: string): Promise<void> {
  // Get discussion status first
  const { data: discussion, error: fetchError } = await supabase
    .from('discussions')
    .select('status')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;
  if (!discussion) throw new Error('Discussion not found');
  
  // Only allow deletion of completed discussions
  if (discussion.status !== 'completed') {
    throw new Error('Only completed discussions can be deleted');
  }

  const { error } = await supabase
    .from('discussions')
    .delete()
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