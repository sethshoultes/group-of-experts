import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Message } from '../../types';
import type { ExpertRole } from '../../lib/experts/roles';
import ExpertInteraction from './ExpertInteraction';

interface MessageThreadProps {
  messages: Message[];
  experts: ExpertRole[];
  onReferenceClick: (messageId: string) => void;
  collapsed?: boolean;
  onCollapse?: () => void;
}

export default function MessageThread({
  messages,
  experts,
  onReferenceClick,
  collapsed = false,
  onCollapse
}: MessageThreadProps) {
  if (messages.length === 0) return null;

  const rootMessage = messages[0];
  const expert = experts.find(e => e.id === rootMessage.expert_role);
  
  if (!expert) return null;

  return (
    <div className="relative">
      {/* Thread Header */}
      <div className="flex items-center space-x-2 mb-2">
        <button
          onClick={onCollapse}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        <span className="text-sm font-medium text-gray-700">
          {expert.name}'s Thread
        </span>
        <span className="text-xs text-gray-500">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Thread Messages */}
      {!collapsed && (
        <div className="space-y-4 pl-6 border-l-2 border-gray-100">
          {messages.map((message, index) => (
            <div key={message.id} className="relative">
              <div className="absolute -left-6 top-1/2 w-6 h-px bg-gray-200" />
              <ExpertInteraction
                message={message}
                expert={expert}
                messageRefs={message.message_refs || []}
                referencedMessages={messages}
                onReferenceClick={onReferenceClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}