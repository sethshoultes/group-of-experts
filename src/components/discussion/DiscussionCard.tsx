import React from 'react';
import { MessageCircle, Clock, Trash2 } from 'lucide-react';
import type { Discussion } from '../../types';

interface DiscussionCardProps {
  discussion: Discussion;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function DiscussionCard({ discussion, onClick, onDelete }: DiscussionCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (discussion.status !== 'completed') {
      return; // Early return if discussion is not completed
    }
    if (window.confirm('Are you sure you want to delete this discussion? This action cannot be undone.')) {
      onDelete(discussion.id);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(discussion.id)}
    >
      <div className="flex justify-between items-start mb-4 group">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{discussion.topic}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            discussion.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {discussion.status}
          </span>
          <button
            onClick={handleDelete}
            className={`p-1 rounded-full transition-opacity ${
              discussion.status === 'completed'
                ? 'text-gray-400 hover:text-red-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100'
                : 'hidden'
            }`}
            title="Delete discussion"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
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