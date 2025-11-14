import React from 'react';
import { Card } from './Card';

interface SkillCategoryProps {
  skills: { name: string; proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' }[];
  title?: string;
}

const proficiencyColors = {
  beginner: 'bg-gray-200',
  intermediate: 'bg-blue-200',
  advanced: 'bg-indigo-400',
  expert: 'bg-indigo-600',
};

const proficiencyLevels = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
};

export const SkillCategory: React.FC<SkillCategoryProps> = ({ skills, title = 'Skills' }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {skills.map((skill) => (
          <div key={skill.name} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{skill.name}</span>
              <span className="text-xs text-gray-500 capitalize">{skill.proficiency}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  proficiencyColors[skill.proficiency]
                }`}
                style={{ width: `${proficiencyLevels[skill.proficiency]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
