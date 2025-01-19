import React from 'react';
import { X, Bug, Trash2 } from 'lucide-react';
import { useDebug } from '../../contexts/DebugContext';

export default function DebugPanel() {
  const { debug, togglePanel, clearLogs } = useDebug();

  if (!debug.enabled || !debug.panelVisible) return null;

  return (
    <div className="fixed bottom-0 right-0 w-96 bg-white shadow-lg rounded-tl-lg border border-gray-200 z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Bug className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-sm font-medium text-gray-900">Debug Panel</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearLogs}
            className="text-gray-400 hover:text-gray-500"
            title="Clear logs"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={togglePanel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="h-64 overflow-auto p-4 bg-gray-50">
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
  );
}