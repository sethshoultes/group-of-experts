import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, XCircle, Loader, Maximize2, Minimize2 } from 'lucide-react';
import { getDiscussion, updateDiscussionStatus, addMessage, updateDiscussionRound } from '../../lib/discussions';
import { getAvailableExperts, getExpertResponse } from '../../lib/experts';
import ExpertSelector from './ExpertSelector';
import type { ExpertRole } from '../../lib/experts/roles';
import type { Discussion } from '../../types';

export default function DiscussionView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [experts, setExperts] = useState<ExpertRole[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [loadingExperts, setLoadingExperts] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadDiscussion(id);
      loadExperts();
    }
  }, [id]);

  const loadExperts = async () => {
    try {
      const availableExperts = await getAvailableExperts();
      console.log('Loaded experts:', availableExperts);
      setExperts(availableExperts);
    } catch (err) {
      console.error('Failed to load experts:', err);
      setError('Failed to load experts');
    } finally {
      setLoadingExperts(false);
    }
  };

  const loadDiscussion = async (discussionId: string) => {
    try {
      const data = await getDiscussion(discussionId);
      setDiscussion(data);
    } catch (err) {
      setError('Failed to load discussion');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!discussion || !id) return;

    try {
      const newStatus = discussion.status === 'active' ? 'completed' : 'active';
      await updateDiscussionStatus(id, newStatus);
      setDiscussion({ ...discussion, status: newStatus });
    } catch (err) {
      setError('Failed to update discussion status');
    }
  };

  const handleAdvanceRound = async () => {
    if (!discussion || !id) return;
    try {
      await updateDiscussionRound(id, discussion.current_round + 1);
      await loadDiscussion(id);
    } catch (err) {
      setError('Failed to advance round');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !id || sending || !selectedExpert) return;
    if (discussion.status === 'completed') return;

    const currentMessage = message;
    setSending(true);
    setError(null);

    try {
      // Add user message
      await addMessage(id, 'user', currentMessage);
      
      // Get expert response with selected expert role
      const response = await getExpertResponse(id, selectedExpert, currentMessage);
      
      // Add expert message with the selected expert role
      await addMessage(id, selectedExpert, response.content);
      
      // Reload discussion to get the new messages
      await loadDiscussion(id);
      setMessage(''); // Only clear on success
    } catch (err) {
      console.error('Message error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (discussion?.messages.length) {
      scrollToBottom();
    }
  }, [discussion?.messages.length]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getFilteredExperts = () => {
    if (!discussion) return experts;
    if (discussion.discussion_mode === 'parallel') {
      return experts;
    }
    // For sequential mode, only show the next expert in order
    const currentRoundMessages = discussion.messages.filter(m => m.round === discussion.current_round);
    const availableExperts = experts.filter(expert => 
      !currentRoundMessages.some(msg => msg.expert_role === expert.id)
    );
    return availableExperts;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Discussion not found</h2>
          <p className="mt-2 text-gray-600">The discussion you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Discussions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-200 ${
      isFullscreen 
        ? 'fixed inset-0 z-50 bg-white' 
        : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
    }`}>
      <div className={`bg-white shadow ${isFullscreen ? '' : 'rounded-lg'}`}>
        <div className={`px-4 py-5 sm:p-6 flex flex-col ${
          isFullscreen ? 'h-screen' : 'h-[calc(100vh-12rem)]'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {!isFullscreen && (
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <h2 className="text-xl font-semibold text-gray-900">{discussion.topic}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleStatusToggle}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                  discussion.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {discussion.status === 'active' ? (
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                ) : (
                  <XCircle className="h-4 w-4 mr-1.5" />
                )}
                {discussion.status === 'active' ? 'Active' : 'Completed'}
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {!isFullscreen && <p className="text-gray-600 mb-6">{discussion.description}</p>}

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          {loadingExperts ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-gray-900">Select an Expert</h3>
                <span className="text-sm text-gray-500">Round {discussion.current_round}</span>
              </div>
              <ExpertSelector
                experts={getFilteredExperts()}
                selectedExpert={selectedExpert}
                onSelect={setSelectedExpert}
                mode={discussion.discussion_mode}
              />
            </div>
          )}

          <div className="space-y-4 flex-1 overflow-y-auto mb-6 pr-2">
            {discussion.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.expert_role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.expert_role === 'user'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-50 text-gray-900'
                  }`}
                >
                  {message.expert_role !== 'user' && (
                    <div className="text-xs font-medium mb-1">
                      {(() => {
                        const expert = experts.find(e => e.id === message.expert_role);
                        return expert ? (
                          <div className="flex items-center space-x-1">
                            <span className="font-bold text-gray-900">{expert.name}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">{expert.title}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Expert</span>
                        );
                      })()}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="mt-4">
            <div className="flex items-center space-x-3 bg-white border-t pt-4">
              {discussion.discussion_mode === 'sequential' &&
               discussion.expert_ids.every(id => 
                 discussion.messages.some(m => 
                   m.expert_role === id && m.round === discussion.current_round
                 )
               ) && (
                <button
                  type="button"
                  onClick={handleAdvanceRound}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-full text-sm font-medium text-gray-600 bg-white hover:bg-gray-50"
                >
                  Next Round
                </button>
              )}
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full border-gray-200 bg-gray-50 px-4 py-2 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                disabled={
                  discussion.status === 'completed' || 
                  !selectedExpert || 
                  (discussion.discussion_mode === 'sequential' && 
                   discussion.messages.some(m => 
                     m.expert_role === selectedExpert && 
                     m.round === discussion.current_round
                   ))
                }
              />
              <button
                type="submit"
                disabled={!message.trim() || sending || discussion.status === 'completed' || !selectedExpert}
                className="inline-flex items-center p-2 text-indigo-500 hover:text-indigo-600 focus:outline-none disabled:opacity-50 disabled:hover:text-indigo-500"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}