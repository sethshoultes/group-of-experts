import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, XCircle, Loader } from 'lucide-react';
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !id || sending || !selectedExpert) return;

    setSending(true);
    setError(null);

    try {
      // Add user message
      await addMessage(id, 'user', message);
      
      // Get expert response
      const response = await getExpertResponse(id, selectedExpert, message);
      
      // Add expert message
      await addMessage(id, response.role, response.content);
      
      setMessage('');
      await loadDiscussion(id);
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900">{discussion.topic}</h2>
            </div>
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
          </div>

          <p className="text-gray-600 mb-6">{discussion.description}</p>

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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select an Expert</h3>
              <ExpertSelector
                experts={experts}
                selectedExpert={selectedExpert}
                onSelect={setSelectedExpert}
              />
            </div>
          )}

          <div className="space-y-4 mb-6">
            {discussion.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.expertRole === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.expertRole === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="mt-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={discussion.status === 'completed' || !selectedExpert}
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