import React from 'react';
import { Settings, Bug, Trash2 } from 'lucide-react';
import { useDebug } from '../../contexts/DebugContext';

export default function AdminPanel() {
  const { debug, toggleDebug, clearLogs } = useDebug();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Tools</h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Debugging</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bug className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Debug Mode</span>
                </div>
                <button
                  onClick={toggleDebug}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    debug.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      debug.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              {debug.enabled && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Debug Logs</span>
                    <button
                      onClick={clearLogs}
                      className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-md p-4 h-64 overflow-auto">
                    {debug.logs.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center">No logs yet</p>
                    ) : (
                      <div className="space-y-2">
                        {debug.logs.map((log, index) => (
                          <div
                            key={index}
                            className={`text-sm ${
                              log.type === 'error'
                                ? 'text-red-600'
                                : log.type === 'warn'
                                ? 'text-yellow-600'
                                : 'text-gray-600'
                            }`}
                          >
                            <span className="text-gray-400">
                              {log.timestamp.toLocaleTimeString()}
                            </span>{' '}
                            {log.message}
                            {log.data && (
                              <pre className="mt-1 text-xs bg-gray-100 p-2 rounded">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}