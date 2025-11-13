import React from 'react';

interface SkillBadgeProps {
  skill: string;
  removable?: boolean;
  onRemove?: () => void;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({ skill, removable, onRemove }) => {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
      {skill}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};
