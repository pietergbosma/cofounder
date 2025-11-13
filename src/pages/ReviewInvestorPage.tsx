import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ThumbsUp, MessageSquare, ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/shared/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { userService, investorReviewService, projectService } from '../services/api';
import { User, Project } from '../types';

export const ReviewInvestorPage: React.FC = () => {
  const { investorId, projectId } = useParams<{ investorId: string; projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [investor, setInvestor] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [helpful, setHelpful] = useState(false);
  const [responsive, setResponsive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [investorId, projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [investorData, projectData] = await Promise.all([
        userService.getUserById(investorId!),
        projectService.getProjectById(projectId!),
      ]);
      setInvestor(investorData);
      setProject(projectData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await investorReviewService.createInvestorReview({
        reviewer_id: user!.id,
        investor_id: investorId!,
        project_id: projectId!,
        rating,
        comment,
        helpful,
        responsive,
      });

      alert('Review submitted successfully!');
      navigate(`/profile/${investorId}`);
    } catch (err) {
      setError('Failed to submit review');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!investor || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Data not found</h3>
            <Button onClick={() => navigate('/my-projects')}>
              Back to Projects
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Investor</h1>
          <p className="text-gray-600">Share your experience working with {investor.name}</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Card className="p-8">
          {/* Investor Info */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200 mb-6">
            <img
              src={investor.avatar_url}
              alt={investor.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{investor.name}</h3>
              <p className="text-sm text-gray-600">Investor • {project.title}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Overall Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {rating === 5 && 'Excellent!'}
                  {rating === 4 && 'Very Good'}
                  {rating === 3 && 'Good'}
                  {rating === 2 && 'Fair'}
                  {rating === 1 && 'Poor'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={6}
                placeholder="Share your experience working with this investor. What did they do well? How did they support your project?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your honest feedback helps other founders make informed decisions
              </p>
            </div>

            {/* Additional Attributes */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Additional Feedback
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                <input
                  type="checkbox"
                  checked={helpful}
                  onChange={(e) => setHelpful(e.target.checked)}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Helpful Beyond Capital</p>
                    <p className="text-sm text-gray-600">Provided strategic advice, introductions, or operational support</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <input
                  type="checkbox"
                  checked={responsive}
                  onChange={(e) => setResponsive(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Very Responsive</p>
                    <p className="text-sm text-gray-600">Quick to respond and always available when needed</p>
                  </div>
                </div>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
