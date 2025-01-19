import React from 'react';
import { MessageCircle, Clock } from 'lucide-react';
import type { Discussion } from '../../types';

interface DiscussionCardProps {
  discussion: Discussion;
  onClick: (id: string) => void;
}

export default function DiscussionCard({ discussion, onClick }: DiscussionCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(discussion.id)}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{discussion.topic}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${
          discussion.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {discussion.status}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{discussion.description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" />
            {discussion.messages.length}
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {new Date(discussion.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}