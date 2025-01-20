import React from 'react';
import type { ExpertRole } from '../../lib/experts/roles';

import { Blocks, Shield, Container } from 'lucide-react';

const EXPERT_ICONS = {
  blocks: Blocks,
  shield: Shield,
  container: Container
};

interface ExpertSelectorProps {
  experts: ExpertRole[];
  selectedExpert: string | null;
  onSelect: (expertId: string) => void;
  mode?: 'sequential' | 'parallel';
}

export default function ExpertSelector({
  experts,
  selectedExpert,
  onSelect,
  mode = 'sequential'
}: ExpertSelectorProps) {
  if (experts.length === 0) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">No API Keys Available</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Please add an API key in your profile settings to start consulting with experts.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {experts.map((expert) => {
          const isSelected = selectedExpert === expert.id;
          
          return (
            <div
              key={expert.id}
              className={`relative rounded-lg border p-4 transition-colors ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:border-indigo-400 cursor-pointer'
              }`}
              onClick={() => onSelect(expert.id)}
            >
              <div className="flex items-center space-x-3">
                {(() => {
                  const Icon = EXPERT_ICONS[expert.icon as keyof typeof EXPERT_ICONS];
                  return Icon ? (
                    <Icon className={`h-6 w-6 ${
                      isSelected ? 'text-indigo-600' : 'text-gray-400'
                    }`} />
                  ) : null;
                })()}
                <h3 className="text-lg font-medium text-gray-900">{expert.name}</h3>
              </div>
              <p className="mt-2 text-sm text-gray-500">{expert.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {expert.expertise.map((skill) => (
                  <span
                    key={skill}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      isSelected
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}