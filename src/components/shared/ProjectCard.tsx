import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ExternalLink } from 'lucide-react';
import { Project } from '../../types';
import { Card } from '../ui/Card';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  showOwner?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, showOwner = true }) => {
  const navigate = useNavigate();

  return (
    <Card hoverable onClick={() => navigate(`/projects/${project.id}`)}>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
            <span className="inline-block mt-1 px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
              {project.category}
            </span>
          </div>
          {project.website && (
            <a
              href={project.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-800"
            >
              <ExternalLink size={20} />
            </a>
          )}
        </div>
        
        <p className="text-gray-600 line-clamp-3">{project.description}</p>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          {showOwner && project.owner && (
            <div className="flex items-center gap-2">
              <img
                src={project.owner.avatar_url}
                alt={project.owner.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-600">{project.owner.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Calendar size={14} />
            <span>{format(new Date(project.created_at), 'MMM yyyy')}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
