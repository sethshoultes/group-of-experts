import type { Message, Discussion } from '../../types';
import type { ExpertRole } from './roles';
import { supabase } from '../supabase';

interface MessageReference {
  messageId: string;
  expertId: string;
  quote: string;
  context: string;
}

interface ExpertInteraction {
  expertId: string;
  content: string;
  references: MessageReference[];
  metadata: {
    confidence: number;
    agreementLevel: number;
    contributionType: 'primary' | 'supporting' | 'alternative';
  };
}

export async function processExpertInteraction(
  discussion: Discussion,
  expert: ExpertRole,
  content: string,
  references: MessageReference[]
): Promise<ExpertInteraction> {
  // Extract references and analyze content
  const processedReferences = references.map(ref => ({
    ...ref,
    context: extractReferenceContext(content, ref.quote)
  }));

  // Calculate metadata
  const metadata = {
    confidence: calculateConfidence(content, processedReferences),
    agreementLevel: calculateAgreementLevel(content, processedReferences),
    contributionType: determineContributionType(content, processedReferences)
  };

  return {
    expertId: expert.id,
    content,
    references: processedReferences,
    metadata
  };
}

function extractReferenceContext(content: string, quote: string): string {
  const quoteIndex = content.indexOf(quote);
  if (quoteIndex === -1) return '';

  // Get surrounding context (50 chars before and after)
  const start = Math.max(0, quoteIndex - 50);
  const end = Math.min(content.length, quoteIndex + quote.length + 50);
  return content.slice(start, end);
}

function calculateConfidence(content: string, references: MessageReference[]): number {
  // Implement confidence scoring based on:
  // 1. Number of specific references
  // 2. Presence of technical details
  // 3. Language certainty markers
  const hasReferences = references.length > 0 ? 0.3 : 0;
  const hasTechnicalDetails = /\b(specifically|technically|in detail)\b/i.test(content) ? 0.3 : 0;
  const hasUncertainty = /\b(might|maybe|perhaps|possibly)\b/i.test(content) ? -0.2 : 0;
  
  return Math.min(1, Math.max(0, 0.5 + hasReferences + hasTechnicalDetails + hasUncertainty));
}

function calculateAgreementLevel(content: string, references: MessageReference[]): number {
  // Analyze agreement based on:
  // 1. Agreement phrases
  // 2. Disagreement phrases
  // 3. Reference context
  const agreementPhrases = /\b(agree|concur|support|correct|right)\b/i;
  const disagreementPhrases = /\b(disagree|differ|contrary|however|but)\b/i;
  
  const agreementCount = (content.match(agreementPhrases) || []).length;
  const disagreementCount = (content.match(disagreementPhrases) || []).length;
  
  return Math.min(1, Math.max(0, 
    0.5 + (agreementCount * 0.2) - (disagreementCount * 0.2)
  ));
}

function determineContributionType(
  content: string,
  references: MessageReference[]
): 'primary' | 'supporting' | 'alternative' {
  const hasAlternative = /\b(alternatively|different approach|another way|instead)\b/i.test(content);
  const hasSupport = /\b(additionally|furthermore|moreover|building on)\b/i.test(content);
  
  if (hasAlternative) return 'alternative';
  if (hasSupport || references.length > 0) return 'supporting';
  return 'primary';
}

export async function addExpertInteraction(
  discussionId: string,
  interaction: ExpertInteraction
): Promise<void> {
  const { error } = await supabase.from('messages').insert({
    discussion_id: discussionId,
    expert_role: interaction.expertId,
    content: interaction.content,
    references: interaction.references,
    metadata: interaction.metadata,
    round: discussion.current_round,
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