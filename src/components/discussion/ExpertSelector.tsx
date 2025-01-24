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
  selectedExperts: string[];
  onSelect: (expertId: string[]) => void;
  mode?: 'sequential' | 'parallel';
}

export default function ExpertSelector({
  experts,
  selectedExperts,
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {experts.map((expert) => {
        const isSelected = selectedExperts.includes(expert.id);
        
        return (
          <div
            key={expert.id}
            className={`relative rounded-lg border p-4 transition-all cursor-pointer ${
              isSelected
                ? 'border-indigo-100 bg-indigo-50'
                : 'border-gray-100 hover:border-indigo-100 hover:bg-gray-50/50'
            }`}
            onClick={() => {
              if (isSelected) {
                onSelect(selectedExperts.filter(id => id !== expert.id));
              } else if (selectedExperts.length < 3) {
                onSelect([...selectedExperts, expert.id]);
              }
            }}
          >
            <div>
              {(() => {
                const Icon = EXPERT_ICONS[expert.icon as keyof typeof EXPERT_ICONS];
                return Icon ? (
                  <Icon className={`h-5 w-5 mb-2 ${
                    isSelected ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                ) : null;
              })()}
              <h3 className="text-base font-semibold text-gray-900">{expert.name}</h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{expert.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {expert.expertise.map((skill) => (
                  <span
                    key={skill}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isSelected
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}