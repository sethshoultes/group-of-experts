import React from 'react';
import { Quote, ThumbsUp, AlertCircle } from 'lucide-react';
import type { Message } from '../../types';
import type { ExpertRole } from '../../lib/experts/roles';

interface ExpertInteractionProps {
  message: Message;
  expert: ExpertRole;
  messageRefs: Array<{
    messageId: string;
    expertId: string;
    quote: string;
  }>;
  referencedMessages: Message[];
  onReferenceClick: (messageId: string) => void;
}

export default function ExpertInteraction({
  message,
  expert,
  messageRefs,
  referencedMessages,
  onReferenceClick
}: ExpertInteractionProps) {
  const metadata = message.metadata || {};
  
  return (
    <div className="relative group">
      <div className="rounded-lg bg-white shadow-sm p-4">
        {/* Expert Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium text-gray-900">{expert.name}</div>
            <span className="text-xs text-gray-500">•</span>
            <div className="text-xs text-gray-500">{expert.title}</div>
          </div>
          
          {/* Confidence Indicator */}
          {metadata.confidence && (
            <div className="flex items-center space-x-1">
              {metadata.confidence > 0.7 ? (
                <ThumbsUp className="w-4 h-4 text-green-500" />
              ) : metadata.confidence < 0.4 ? (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              ) : null}
              <span className="text-xs text-gray-500">
                {Math.round(metadata.confidence * 100)}% confidence
              </span>
            </div>
          )}
        </div>

        {/* References */}
        {messageRefs.length > 0 && (
          <div className="mb-3 space-y-2">
            {messageRefs.map((ref, index) => {
              const refMessage = referencedMessages.find(m => m.id === ref.messageId);
              const refExpert = refMessage?.expert_role;
              
              return (
                <div
                  key={index}
                  className="text-sm bg-gray-50 rounded p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => onReferenceClick(ref.messageId)}
                >
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <Quote className="w-3 h-3 mr-1" />
                    <span>Referencing {refExpert}</span>
                  </div>
                  <div className="text-gray-700">{ref.quote}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Message Content */}
        <div className="prose prose-sm max-w-none">
          {message.content}
        </div>

        {/* Metadata Tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          {metadata.contributionType && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              metadata.contributionType === 'primary'
                ? 'bg-blue-100 text-blue-800'
                : metadata.contributionType === 'supporting'
                ? 'bg-green-100 text-green-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {metadata.contributionType}
            </span>
          )}
          {metadata.agreementLevel !== undefined && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              metadata.agreementLevel > 0.7
                ? 'bg-green-100 text-green-800'
                : metadata.agreementLevel < 0.4
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {metadata.agreementLevel > 0.7
                ? 'Strong Agreement'
                : metadata.agreementLevel < 0.4
                ? 'Alternative View'
                : 'Neutral'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}