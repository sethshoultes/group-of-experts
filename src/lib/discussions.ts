import { supabase } from './supabase';
import type { Discussion } from '../types';

export async function getDiscussions(): Promise<Discussion[]> {
  const { data, error } = await supabase
    .from('discussions')
    .select('*, messages (*)');

  if (error) throw error;
  return data.map(discussion => ({
    ...discussion,
    messages: discussion.messages.map((message: any) => ({
      ...message,
      message_refs: message.message_refs || [],
      metadata: message.metadata || {
        confidence: 0.7,
        agreementLevel: 0.5,
        contributionType: 'primary'
      },
      timestamp: new Date(message.created_at)
    }))
  }));
}

export async function getDiscussion(id: string): Promise<Discussion> {
  const { data, error } = await supabase
    .from('discussions')
    .select(`
      *,
      messages (
        id,
        discussion_id,
        expert_role,
        content,
        round,
        message_refs,
        metadata,
        response_order,
        created_at,
        updated_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  return {
    ...data,
    expert_ids: data.expert_ids || [],
    discussion_mode: data.discussion_mode || 'sequential',
    current_round: data.current_round || 1,
    metadata: data.metadata || {},
    messages: data.messages.map((message: any) => ({
      ...message,
      message_refs: message.message_refs || [],
      metadata: message.metadata || {
        confidence: 0.7,
        agreementLevel: 0.5,
        contributionType: 'primary'
      },
      timestamp: new Date(message.created_at)
    }))
  };
}

export async function createDiscussion(
  topic: string,
  description: string,
  expertIds?: string[],
  discussionMode: 'sequential' | 'parallel' = 'sequential'
): Promise<Discussion> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('discussions')
    .insert({
      user_id: user.id,
      topic,
      description,
      status: 'active',
      expert_ids: expertIds || [],
      discussion_mode: discussionMode || 'sequential',
      current_round: 1,
      metadata: {}
    })
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    expert_ids: data.expert_ids || [],
    discussion_mode: data.discussion_mode || 'sequential',
    current_round: data.current_round || 1,
    metadata: data.metadata || {},
    messages: []
  };
}

export async function updateDiscussionRound(id: string, round: number): Promise<void> {
  const { error } = await supabase
    .from('discussions')
    .update({ current_round: round })
    .eq('id', id);

  if (error) throw error;
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
  content: string,
  messageRefs: any[] = [],
  metadata: any = {}
): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .insert({
      discussion_id: discussionId,
      expert_role: expertRole,
      content,
      message_refs: messageRefs,
      metadata
    });

  if (error) throw error;
}