import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquarePlus, Users, AlertCircle } from 'lucide-react';
import { createDiscussion } from '../../lib/discussions';
import { getAvailableExperts } from '../../lib/experts';
import type { ExpertRole } from '../../lib/experts/roles';
import ExpertSelector from './ExpertSelector';

export default function NewDiscussion() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);
  const [experts, setExperts] = useState<ExpertRole[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(true);
  const [discussionMode, setDiscussionMode] = useState<'sequential' | 'parallel'>('sequential');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    loadExperts();
  }, []);

  const loadExperts = async () => {
    setLoadingExperts(true);
    try {
      const availableExperts = await getAvailableExperts();
      setExperts(availableExperts);
    } catch (err) {
      setError('Failed to load experts');
    } finally {
      setLoadingExperts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedExperts.length === 0) {
      setError('Please select at least one expert');
      return;
    }

    if (selectedExperts.length > 3) {
      setError('Maximum of 3 experts allowed');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const discussion = await createDiscussion(
        topic,
        description,
        selectedExperts,
        discussionMode
      );
      navigate(`/discussions/${discussion.id}`);
    } catch (err) {
      console.error('Create discussion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create discussion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">New Discussion</h2>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                Topic
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., Microservices Architecture Design"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Describe what you'd like to discuss..."
                required
              />
            </div>

            <div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Experts (2-3)
                </label>
                {loadingExperts ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : experts.length === 0 ? (
                  <div className="rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">No API Keys Available</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Please add an API key in your profile settings to start consulting with experts.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ExpertSelector
                    experts={experts}
                    selectedExperts={selectedExperts}
                    onSelect={setSelectedExperts}
                    mode={discussionMode}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discussion Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDiscussionMode('sequential')}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    discussionMode === 'sequential'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  <div className="font-medium text-gray-900">Sequential</div>
                  <p className="mt-1 text-sm text-gray-500">
                    Experts respond one after another, building on previous responses
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setDiscussionMode('parallel')}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    discussionMode === 'parallel'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  <div className="font-medium text-gray-900">Parallel</div>
                  <p className="mt-1 text-sm text-gray-500">
                    All experts respond simultaneously for each round
                  </p>
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedExperts.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Discussion'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}