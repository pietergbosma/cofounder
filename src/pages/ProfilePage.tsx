import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mail,
  MapPin,
  Clock,
  Edit,
  Linkedin,
  Github,
  Twitter,
  Globe,
  ExternalLink,
  Award,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/shared/Navbar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StarRating } from '../components/ui/StarRating';
import { ReviewCard } from '../components/shared/ReviewCard';
import { ProfileCompletionIndicator } from '../components/ui/ProfileCompletionIndicator';
import { SkillCategory } from '../components/ui/SkillCategory';
import { ProjectShowcaseCard } from '../components/ui/ProjectShowcaseCard';
import { userService, projectMemberService, reviewService } from '../services/api';
import { profileService } from '../services/profileService';
import { User, ProjectMember, Review } from '../types';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectMember[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !userId || userId === currentUser?.id;
  const profileUserId = userId || currentUser?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileUserId) return;
      
      try {
        const [userData, projectData, reviewData] = await Promise.all([
          userService.getUserById(profileUserId),
          projectMemberService.getMembersByUser(profileUserId),
          reviewService.getReviewsForUser(profileUserId),
        ]);

        if (userData) {
          setUser(userData);
        }
        setProjects(projectData);
        setReviews(reviewData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileUserId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-gray-600">Loading profile...</div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <p className="text-center text-gray-600 py-8">User not found</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </Card>
        </div>
      </>
    );
  }

  const completion = profileService.calculateProfileCompletion(user);
  const skillsWithProficiency = profileService.formatSkillsWithProficiency(user);
  const availabilityLabel = profileService.getAvailabilityLabel(user.availability_status);
  const availabilityColor = profileService.getAvailabilityColor(user.availability_status);

  const socialLinks = [
    { icon: Linkedin, url: user.social_links?.linkedin, label: 'LinkedIn', color: 'text-blue-600' },
    { icon: Github, url: user.social_links?.github, label: 'GitHub', color: 'text-gray-800' },
    { icon: Twitter, url: user.social_links?.twitter, label: 'Twitter', color: 'text-blue-400' },
    { icon: Globe, url: user.social_links?.portfolio, label: 'Portfolio', color: 'text-indigo-600' },
    { icon: Globe, url: user.social_links?.website, label: 'Website', color: 'text-indigo-600' },
  ].filter(link => link.url);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-3 text-indigo-100">
                  <div className="flex items-center gap-2">
                    <Mail size={18} />
                    <span>{user.email}</span>
                  </div>
                  {user.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={18} />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.timezone && (
                    <div className="flex items-center gap-2">
                      <Clock size={18} />
                      <span>{user.timezone}</span>
                    </div>
                  )}
                </div>
                {user.average_rating && (
                  <div className="mb-3">
                    <StarRating rating={user.average_rating} />
                  </div>
                )}
                {user.availability_status && (
                  <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${availabilityColor}`}>
                    {availabilityLabel}
                  </span>
                )}
              </div>
              {isOwnProfile && (
                <Button
                  onClick={() => navigate('/profile/edit')}
                  variant="outline"
                  className="bg-white text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                >
                  <Edit size={18} />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              {user.bio && (
                <Card>
                  <p className="text-gray-700 text-lg leading-relaxed">{user.bio}</p>
                </Card>
              )}

              {/* Professional Summary */}
              {user.professional_summary && (
                <Card>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Summary</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {user.professional_summary}
                  </p>
                </Card>
              )}

              {/* Experience */}
              {user.experience && (
                <Card>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Experience & Background</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {user.experience}
                  </p>
                </Card>
              )}

              {/* Achievements */}
              {user.achievements && user.achievements.length > 0 && (
                <Card>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="text-indigo-600" size={24} />
                    Achievements
                  </h2>
                  <ul className="space-y-3">
                    {user.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-indigo-600 mt-1">•</span>
                        <span className="text-gray-700 flex-1">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Projects */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Projects & Roles ({projects.length})
                </h2>
                {projects.length > 0 ? (
                  <div className="grid gap-4">
                    {projects.map((membership) => (
                      <ProjectShowcaseCard key={membership.id} membership={membership} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <p className="text-gray-600 text-center py-8">Not part of any projects yet</p>
                  </Card>
                )}
              </div>

              {/* Reviews */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Reviews ({reviews.length})
                </h2>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <p className="text-gray-600 text-center py-8">No reviews yet</p>
                  </Card>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Completion (only for own profile) */}
              {isOwnProfile && (
                <ProfileCompletionIndicator
                  percentage={completion.percentage}
                  completedFields={completion.completedFields}
                  missingFields={completion.missingFields}
                />
              )}

              {/* Skills */}
              {skillsWithProficiency.length > 0 && (
                <SkillCategory skills={skillsWithProficiency} title="Skills & Expertise" />
              )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect</h3>
                  <div className="space-y-3">
                    {socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition-colors"
                      >
                        <link.icon size={20} className={link.color} />
                        <span className="flex-1 font-medium">{link.label}</span>
                        <ExternalLink size={16} className="text-gray-400" />
                      </a>
                    ))}
                  </div>
                </Card>
              )}

              {/* Contact (old contact field if exists) */}
              {user.contact && !socialLinks.length && (
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact</h3>
                  <p className="text-gray-600 text-sm break-all">{user.contact}</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
