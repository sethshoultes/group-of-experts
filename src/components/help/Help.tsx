import React from 'react';
import { ArrowLeft, Users, GitBranch, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Help() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center space-x-4">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Help & Documentation</h1>
      </div>

      <div className="space-y-8">
        {/* Discussion Modes */}
        <section className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Discussion Modes</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Sequential Mode */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <GitBranch className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-medium">Sequential Mode</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• Experts respond one after another</li>
                <li>• Wait for each expert's response</li>
                <li>• Structured, ordered discussion</li>
                <li>• "Next Round" advances discussion</li>
              </ul>
            </div>

            {/* Parallel Mode */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-medium">Parallel Mode</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• All experts respond simultaneously</li>
                <li>• Choose any expert at any time</li>
                <li>• Quick, diverse perspectives</li>
                <li>• More dynamic interaction</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How Rounds Work */}
        <section className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <RotateCw className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">How Rounds Work</h2>
          </div>

          <div className="space-y-6">
            {/* Sequential Flow */}
            <div>
              <h3 className="text-lg font-medium mb-3">Sequential Mode Flow</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ol className="space-y-2 text-gray-600">
                  <li>1. User asks question</li>
                  <li>2. Expert A responds</li>
                  <li>3. Expert B responds</li>
                  <li>4. Expert C responds</li>
                  <li>5. "Next Round" button appears</li>
                  <li>6. Click "Next Round" to advance</li>
                  <li>7. Process repeats for next round</li>
                </ol>
              </div>
            </div>

            {/* Parallel Flow */}
            <div>
              <h3 className="text-lg font-medium mb-3">Parallel Mode Flow</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ol className="space-y-2 text-gray-600">
                  <li>1. User asks question</li>
                  <li>2. Select any available expert</li>
                  <li>3. Get responses in any order</li>
                  <li>4. All experts can respond</li>
                  <li>5. More flexible interaction</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Tips */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Tips</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Sequential Mode Best For:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Building on previous expert insights</li>
                <li>Step-by-step problem solving</li>
                <li>Structured analysis</li>
                <li>Clear progression of thought</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Parallel Mode Best For:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Quick gathering of perspectives</li>
                <li>Independent expert analysis</li>
                <li>Comparing different viewpoints</li>
                <li>More dynamic discussions</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}