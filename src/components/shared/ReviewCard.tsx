import React from 'react';
import { Review } from '../../types';
import { Card } from '../ui/Card';
import { StarRating } from '../ui/StarRating';
import { format } from 'date-fns';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <Card>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            {review.reviewer && (
              <div className="flex items-center gap-2">
                <img
                  src={review.reviewer.avatar_url}
                  alt={review.reviewer.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{review.reviewer.name}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(review.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}
          </div>
          <StarRating rating={review.rating} showNumber={false} />
        </div>

        {review.project && (
          <p className="text-sm text-gray-600">
            Project: <span className="font-medium">{review.project.title}</span>
          </p>
        )}

        <p className="text-gray-700">{review.comment}</p>
      </div>
    </Card>
  );
};
