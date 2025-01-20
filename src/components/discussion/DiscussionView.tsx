import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, XCircle, Loader, Maximize2, Minimize2 } from 'lucide-react';
import { getDiscussion, updateDiscussionStatus, addMessage } from '../../lib/discussions';
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
      setExperts(availableExperts);
    } catch (err) {
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

    const currentMessage = message;
    setSending(true);
    setError(null);
    setMessage(''); // Clear input early for better UX

    try {
      // Add user message
      await addMessage(id, 'user', currentMessage);
      
      // Get expert response with selected expert role
      const response = await getExpertResponse(id, selectedExpert, currentMessage);
      
      // Add expert message with the selected expert role
      await addMessage(id, selectedExpert, response.content);
      
      // Reload discussion to get the new messages
      await loadDiscussion(id);
    } catch (err) {
      setError('Failed to send message');
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

  const getAvailableExperts = () => {
    if (!discussion) return experts;
    if (discussion.discussion_mode === 'parallel') {
      return experts.filter(e => discussion.expert_ids.includes(e.id));
    }
    // For sequential mode, only show the next expert in order
    const currentExpertIndex = discussion.expert_ids.findIndex(id => id === selectedExpert);
    return experts.filter(e => e.id === discussion.expert_ids[currentExpertIndex + 1]);
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
              <Loader className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {discussion.discussion_mode === 'sequential' ? 'Next Expert' : 'Available Experts'}
                </h3>
                <div className="text-sm text-gray-500">
                  Round {discussion.current_round}
                </div>
              </div>
              <ExpertSelector
                experts={getAvailableExperts()}
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
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.expert_role !== 'user' && (
                    <div className="text-xs font-medium mb-1 text-indigo-600">
                      {(() => {
                        const expert = experts.find(e => e.id === message.expert_role);
                        return expert ? (
                          <div className="flex items-center space-x-1">
                            <span className="font-bold text-indigo-700">{expert.name}</span>
                            <span className="text-indigo-400">•</span>
                            <span className="text-indigo-500">{expert.title}</span>
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
            <div className="flex space-x-3">
              {discussion.discussion_mode === 'sequential' &&
               discussion.expert_ids.every(id => 
                 discussion.messages.some(m => 
                   m.expert_role === id && m.round === discussion.current_round
                 )
               ) && (
                <button
                  type="button"
                  onClick={handleAdvanceRound}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next Round
                </button>
              )}
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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