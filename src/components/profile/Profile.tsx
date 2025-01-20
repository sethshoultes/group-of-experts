import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, AlertCircle } from 'lucide-react';
import { getUserApiKeys, addApiKey, deleteApiKey, updateApiKey } from '../../lib/auth';
import type { ApiKey } from '../../types';

export default function Profile() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddKey, setShowAddKey] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', key: '', provider: 'claude' as const });
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const keys = await getUserApiKeys();
      setApiKeys(keys);
    } catch (err) {
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setValidating(true);
      const key = await addApiKey(newKey);
      setApiKeys([...apiKeys, key]);
      setShowAddKey(false);
      setNewKey({ name: '', key: '', provider: 'claude' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add API key');
    } finally {
      setValidating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await deleteApiKey(id);
      setApiKeys(apiKeys.filter(key => key.id !== id));
    } catch (err) {
      setError('Failed to delete API key');
    }
  };

  const handleToggleKey = async (key: ApiKey) => {
    try {
      const updatedKey = await updateApiKey(key.id, { is_active: !key.is_active });
      setApiKeys(apiKeys.map(k => k.id === key.id ? updatedKey : k));
    } catch (err) {
      setError('Failed to update API key');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">API Keys</h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage your API keys for Claude and OpenAI
              </p>
            </div>
            <button
              onClick={() => setShowAddKey(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add API Key
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {showAddKey && (
            <form onSubmit={handleAddKey} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Key Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="key" className="block text-sm font-medium text-gray-700">
                  API Key
                </label>
                <input
                  type="password"
                  id="key"
                  value={newKey.key}
                  onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
                  Provider
                </label>
                <select
                  id="provider"
                  value={newKey.provider}
                  onChange={(e) => setNewKey({ ...newKey, provider: e.target.value as 'openai' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="openai">OpenAI</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddKey(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={validating}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {validating ? 'Validating...' : 'Add Key'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 divide-y divide-gray-200">
            {apiKeys.map((key) => (
              <div key={key.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Key className="h-5 w-5 text-gray-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{key.name}</p>
                      <p className="text-sm text-gray-500">{key.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleKey(key)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        key.is_active ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className="sr-only">Toggle API key</span>
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          key.is_active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}