import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/shared/Navbar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SkillBadge } from '../components/ui/SkillBadge';
import { StarRating } from '../components/ui/StarRating';
import { ReviewCard } from '../components/shared/ReviewCard';
import { userService, projectMemberService, reviewService } from '../services/api';
import { User, ProjectMember, Review } from '../types';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectMember[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    experience: '',
    contact: '',
    skills: [] as string[],
    newSkill: '',
  });

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
          setEditForm({
            name: userData.name,
            bio: userData.bio,
            experience: userData.experience,
            contact: userData.contact,
            skills: [...userData.skills],
            newSkill: '',
          });
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

  const handleSaveProfile = async () => {
    if (!profileUserId) return;

    try {
      const updated = await userService.updateUser(profileUserId, {
        name: editForm.name,
        bio: editForm.bio,
        experience: editForm.experience,
        contact: editForm.contact,
        skills: editForm.skills,
      });
      setUser(updated);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAddSkill = () => {
    if (editForm.newSkill.trim() && !editForm.skills.includes(editForm.newSkill.trim())) {
      setEditForm({
        ...editForm,
        skills: [...editForm.skills, editForm.newSkill.trim()],
        newSkill: '',
      });
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setEditForm({
      ...editForm,
      skills: editForm.skills.filter(s => s !== skill),
    });
  };

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <Card className="mb-8">
            <div className="flex items-start gap-6">
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-24 h-24 rounded-full"
              />
              <div className="flex-1">
                {editing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="text-3xl font-bold mb-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                )}
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={18} />
                    <span>{user.email}</span>
                  </div>
                  {user.average_rating && (
                    <StarRating rating={user.average_rating} />
                  )}
                </div>

                {editing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Tell others about yourself..."
                  />
                ) : (
                  <p className="text-gray-600 mb-4">{user.bio || 'No bio yet'}</p>
                )}

                {isOwnProfile && (
                  <div className="flex gap-2 mt-4">
                    {editing ? (
                      <>
                        <Button onClick={handleSaveProfile}>Save Changes</Button>
                        <Button variant="outline" onClick={() => setEditing(false)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" onClick={() => setEditing(true)}>
                        <Edit size={18} className="mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Experience */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
                {editing ? (
                  <textarea
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Describe your experience..."
                  />
                ) : (
                  <p className="text-gray-600">{user.experience || 'No experience listed'}</p>
                )}
              </Card>

              {/* Projects */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Projects & Roles</h2>
                {projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map((membership) => (
                      <div
                        key={membership.id}
                        className="flex justify-between items-start p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h3 className="font-bold text-gray-900">{membership.project?.title}</h3>
                          <p className="text-sm text-gray-600">{membership.role}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/projects/${membership.project_id}`)}
                        >
                          View Project
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Not part of any projects yet</p>
                )}
              </Card>

              {/* Reviews */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews ({reviews.length})</h2>
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
              {/* Skills */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
                {editing ? (
                  <>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={editForm.newSkill}
                        onChange={(e) => setEditForm({ ...editForm, newSkill: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                        placeholder="Add a skill..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <Button size="sm" onClick={handleAddSkill}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.skills.map((skill) => (
                        <SkillBadge
                          key={skill}
                          skill={skill}
                          removable
                          onRemove={() => handleRemoveSkill(skill)}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.length > 0 ? (
                      user.skills.map((skill) => <SkillBadge key={skill} skill={skill} />)
                    ) : (
                      <p className="text-gray-600 text-sm">No skills listed</p>
                    )}
                  </div>
                )}
              </Card>

              {/* Contact */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.contact}
                    onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                    placeholder="linkedin.com/in/yourprofile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                ) : (
                  <p className="text-gray-600 text-sm break-all">
                    {user.contact || 'No contact info'}
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
