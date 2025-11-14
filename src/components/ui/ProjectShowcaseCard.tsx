import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Calendar } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { ProjectMember } from '../../types';

interface ProjectShowcaseCardProps {
  membership: ProjectMember;
}

export const ProjectShowcaseCard: React.FC<ProjectShowcaseCardProps> = ({ membership }) => {
  const navigate = useNavigate();
  const project = membership.project;

  if (!project) return null;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{project.title}</h3>
            <p className="text-sm text-indigo-600 font-medium">{membership.role}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/projects/${project.id}`)}
            className="flex items-center gap-1"
          >
            <ExternalLink size={16} />
          </Button>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={14} />
            <span>
              Joined {new Date(membership.joined_at).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">
            {project.category}
          </span>
        </div>
      </div>
    </Card>
  );
};
