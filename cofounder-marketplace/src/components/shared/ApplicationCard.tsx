import React from 'react';
import { Application } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { StarRating } from '../ui/StarRating';
import { useNavigate } from 'react-router-dom';

interface ApplicationCardProps {
  application: Application;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onAccept,
  onReject,
  showActions = false,
}) => {
  const navigate = useNavigate();
  
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            {application.applicant && (
              <>
                <img
                  src={application.applicant.avatar_url}
                  alt={application.applicant.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{application.applicant.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {application.applicant.average_rating && (
                      <StarRating rating={application.applicant.average_rating} size={14} />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{application.applicant.experience}</p>
                </div>
              </>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </span>
        </div>

        {application.position && (
          <div className="bg-gray-50 rounded p-3">
            <p className="text-sm font-medium text-gray-700">
              Applied for: <span className="text-blue-600">{application.position.title}</span>
            </p>
            {application.position.project && (
              <p className="text-sm text-gray-600 mt-1">
                Project: {application.position.project.title}
              </p>
            )}
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Cover Letter:</p>
          <p className="text-gray-600">{application.message}</p>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Applied {format(new Date(application.created_at), 'MMM dd, yyyy')}
          </p>
          
          <div className="flex gap-2">
            {application.applicant && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/profile/${application.applicant?.id}`)}
              >
                View Profile
              </Button>
            )}
            {showActions && application.status === 'pending' && (
              <>
                {onAccept && (
                  <Button size="sm" onClick={() => onAccept(application.id)}>
                    Accept
                  </Button>
                )}
                {onReject && (
                  <Button variant="danger" size="sm" onClick={() => onReject(application.id)}>
                    Reject
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
