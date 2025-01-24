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
      *, messages(*)
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
      round: message.round || 1,
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

  // Ensure we have valid expert IDs
  if (!expertIds || expertIds.length === 0) {
    throw new Error('At least one expert must be selected');
  }

  const { data, error } = await supabase
    .from('discussions')
    .insert({
      user_id: user.id,
      topic,
      description,
      status: 'active',
      expert_ids: expertIds,
      discussion_mode: discussionMode,
      current_round: 1,
      metadata: {}
    }).select('*')
    .single();

  if (error) {
    console.error('Create discussion error:', error);
    throw new Error(error.message);
  }

  return {
    ...data,
    messages: [],
    expert_ids: data.expert_ids || [],
    discussion_mode: data.discussion_mode || 'sequential',
    current_round: data.current_round || 1,
    metadata: data.metadata || {}
  };
}

export async function updateDiscussionRound(id: string, round: number): Promise<void> {
  const { error } = await supabase
    .from('discussions')
    .update({ 
      current_round: round,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw error;
}

export async function updateDiscussionStatus(id: string, status: 'active' | 'completed'): Promise<void> {
  const { error } = await supabase
    .from('discussions')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
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
  // Get current discussion to get the round
  const { data: discussion, error: discussionError } = await supabase
    .from('discussions')
    .select('current_round')
    .eq('id', discussionId)
    .single();

  if (discussionError) throw discussionError;

  const { error } = await supabase
    .from('messages')
    .insert({
      discussion_id: discussionId,
      expert_role: expertRole,
      content,
      round: discussion.current_round,
      message_refs: messageRefs,
      metadata,
      response_order: await getNextResponseOrder(discussionId, discussion.current_round)
    });

  if (error) throw error;
}

async function getNextResponseOrder(discussionId: string, round: number): Promise<number> {
  const { data, error } = await supabase
    .from('messages')
    .select('response_order')
    .eq('discussion_id', discussionId)
    .eq('round', round)
    .order('response_order', { ascending: false })
    .limit(1);

  if (error) throw error;
  return data && data.length > 0 ? (data[0].response_order || 0) + 1 : 1;
}