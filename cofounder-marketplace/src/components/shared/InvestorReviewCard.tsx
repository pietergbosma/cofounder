import React from 'react';
import { InvestorReview } from '../../types';
import { Card } from '../ui/Card';
import { StarRating } from '../ui/StarRating';
import { ThumbsUp, MessageSquare } from 'lucide-react';

interface InvestorReviewCardProps {
  review: InvestorReview;
}

export const InvestorReviewCard: React.FC<InvestorReviewCardProps> = ({ review }) => {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={review.reviewer?.avatar_url}
            alt={review.reviewer?.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h4 className="font-semibold text-gray-900">{review.reviewer?.name}</h4>
            <p className="text-sm text-gray-600">
              {review.project?.title}
            </p>
          </div>
        </div>
        <div className="text-right">
          <StarRating rating={review.rating} />
          <p className="text-xs text-gray-500 mt-1">
            {new Date(review.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <p className="text-gray-700 mb-3">{review.comment}</p>

      <div className="flex gap-4 pt-3 border-t border-gray-200">
        {review.helpful && (
          <div className="flex items-center gap-1.5 text-sm text-green-600">
            <ThumbsUp className="w-4 h-4" />
            <span>Helpful beyond capital</span>
          </div>
        )}
        {review.responsive && (
          <div className="flex items-center gap-1.5 text-sm text-blue-600">
            <MessageSquare className="w-4 h-4" />
            <span>Very responsive</span>
          </div>
        )}
      </div>
    </Card>
  );
};
