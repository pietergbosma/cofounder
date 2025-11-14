import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { Card } from './Card';

interface ProfileCompletionIndicatorProps {
  percentage: number;
  completedFields: string[];
  missingFields: string[];
}

export const ProfileCompletionIndicator: React.FC<ProfileCompletionIndicatorProps> = ({
  percentage,
  completedFields,
  missingFields,
}) => {
  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
          <span className="text-2xl font-bold text-indigo-600">{percentage}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Complete your profile:</p>
            <ul className="space-y-1.5">
              {missingFields.map((field) => (
                <li key={field} className="flex items-center gap-2 text-sm text-gray-600">
                  <Circle size={14} className="text-gray-400" />
                  <span>{field}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {percentage === 100 && (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <CheckCircle2 size={18} />
            <span>Profile complete!</span>
          </div>
        )}
      </div>
    </Card>
  );
};
