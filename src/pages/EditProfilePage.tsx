import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/shared/Navbar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProfileCompletionIndicator } from '../components/ui/ProfileCompletionIndicator';
import { AvatarUpload } from '../components/ui/AvatarUpload';
import { userService } from '../services/api';
import { storageService } from '../services/storageService';
import { profileService } from '../services/profileService';
import { profileEditSchema, ProfileEditFormData } from '../schemas/profileSchema';
import { User } from '../types';

export const EditProfilePage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');

  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name: currentUser?.name || '',
      bio: currentUser?.bio || '',
      professional_summary: currentUser?.professional_summary || '',
      experience: currentUser?.experience || '',
      location: currentUser?.location || '',
      timezone: currentUser?.timezone || '',
      availability_status: currentUser?.availability_status || 'available',
      skills: currentUser?.skills || [],
      skill_proficiencies: currentUser?.skill_proficiencies || {},
      achievements: currentUser?.achievements || [],
      social_links: currentUser?.social_links || {
        linkedin: '',
        github: '',
        twitter: '',
        portfolio: '',
        website: '',
      },
    },
  });

  const watchedFields = watch();

  // Load fresh profile data when component mounts
  useEffect(() => {
    const loadProfileData = async () => {
      if (!currentUser) return;

      try {
        const profileData = await userService.getUserById(currentUser.id);
        if (profileData) {
          // Update form with fresh data
          setValue('name', profileData.name || '');
          setValue('bio', profileData.bio || '');
          setValue('professional_summary', profileData.professional_summary || '');
          setValue('experience', profileData.experience || '');
          setValue('location', profileData.location || '');
          setValue('timezone', profileData.timezone || '');
          setValue('availability_status', profileData.availability_status || 'available');
          setValue('skills', profileData.skills || []);
          setValue('skill_proficiencies', profileData.skill_proficiencies || {});
          setValue('achievements', Array.isArray(profileData.achievements) ? profileData.achievements : []);
          setValue('social_links', {
            linkedin: profileData.linkedin_url || '',
            github: profileData.github_url || '',
            twitter: profileData.twitter_url || '',
            website: profileData.website_url || '',
            portfolio: profileData.portfolio_url || '',
          });
          
          // Update avatar state
          if (profileData.avatar_url) {
            setAvatarUrl(profileData.avatar_url);
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    loadProfileData();
  }, [currentUser?.id, setValue]);

  const handleAvatarUpload = async (file: File) => {
    if (!currentUser) return;

    setUploading(true);
    try {
      // Ensure bucket exists
      await storageService.ensureProfileBucket();

      // Delete old avatar if exists and is from our storage
      if (avatarUrl && avatarUrl.includes('supabase')) {
        await storageService.deleteAvatar(avatarUrl);
      }

      // Upload new avatar
      const newAvatarUrl = await storageService.uploadAvatar(currentUser.id, file);
      setAvatarUrl(newAvatarUrl);

      // Update profile immediately
      await userService.updateUser(currentUser.id, { avatar_url: newAvatarUrl });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert(error.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProfileEditFormData) => {
    if (!currentUser) return;

    setLoading(true);
    setSaveSuccess(false);

    try {
      // Transform social_links from form format to database format
      const databaseUpdates = {
        ...data,
        avatar_url: avatarUrl,
        // Convert social_links JSON to individual URL fields
        linkedin_url: data.social_links?.linkedin || '',
        github_url: data.social_links?.github || '',
        twitter_url: data.social_links?.twitter || '',
        website_url: data.social_links?.website || '',
        portfolio_url: data.social_links?.portfolio || '',
        // Remove the JSON social_links field as we're using individual fields
        social_links: undefined,
      };
      
      await userService.updateUser(currentUser.id, databaseUpdates);
      setSaveSuccess(true);
      
      // Reload fresh data to ensure form shows updated values
      const updatedProfile = await userService.getUserById(currentUser.id);
      if (updatedProfile) {
        setValue('name', updatedProfile.name || '');
        setValue('bio', updatedProfile.bio || '');
        setValue('professional_summary', updatedProfile.professional_summary || '');
        setValue('experience', updatedProfile.experience || '');
        setValue('location', updatedProfile.location || '');
        setValue('timezone', updatedProfile.timezone || '');
        setValue('availability_status', updatedProfile.availability_status || 'available');
        setValue('skills', updatedProfile.skills || []);
        setValue('skill_proficiencies', updatedProfile.skill_proficiencies || {});
        setValue('achievements', Array.isArray(updatedProfile.achievements) ? updatedProfile.achievements : []);
        setValue('social_links', {
          linkedin: updatedProfile.linkedin_url || '',
          github: updatedProfile.github  || '',
          twitter: updatedProfile.twitter_url || '',
          website: updatedProfile.website_url || '',
          portfolio: updatedProfile.portfolio_url || '',
        });
      }
      
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !watchedFields.skills.includes(newSkill.trim())) {
      const updatedSkills = [...watchedFields.skills, newSkill.trim()];
      setValue('skills', updatedSkills);
      setValue(`skill_proficiencies.${newSkill.trim()}`, 'intermediate');
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const updatedSkills = watchedFields.skills.filter(s => s !== skill);
    setValue('skills', updatedSkills);
    
    const updatedProficiencies = { ...watchedFields.skill_proficiencies };
    delete updatedProficiencies[skill];
    setValue('skill_proficiencies', updatedProficiencies);
  };

  const handleSkillProficiencyChange = (
    skill: string,
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  ) => {
    setValue(`skill_proficiencies.${skill}`, proficiency);
  };

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      setValue('achievements', [...watchedFields.achievements, newAchievement.trim()]);
      setNewAchievement('');
    }
  };

  const handleRemoveAchievement = (index: number) => {
    setValue('achievements', watchedFields.achievements.filter((_, i) => i !== index));
  };

  if (!currentUser) {
    return null;
  }

  const mockUser: User = { ...currentUser, ...watchedFields, avatar_url: avatarUrl };
  const completion = profileService.calculateProfileCompletion(mockUser);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600 mt-1">Update your professional information</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </Button>
          </div>

          {saveSuccess && (
            <Card className="mb-6 bg-green-50 border-green-200">
              <p className="text-green-800 font-medium">Profile updated successfully!</p>
            </Card>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Avatar Upload */}
                <Card>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Picture</h2>
                  <AvatarUpload
                    currentAvatarUrl={avatarUrl}
                    onUpload={handleAvatarUpload}
                    uploading={uploading}
                  />
                </Card>

                {/* Basic Information */}
                <Card>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio *
                      </label>
                      <textarea
                        {...register('bio')}
                        rows={3}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.bio ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="A brief introduction about yourself"
                      />
                      <div className="flex justify-between items-center mt-1">
                        {errors.bio ? (
                          <p className="text-red-600 text-sm">{errors.bio.message}</p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            {watchedFields.bio?.length || 0} characters
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        {...register('location')}
                        type="text"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.location ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="City, Country"
                      />
                      {errors.location && (
                        <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <input
                        {...register('timezone')}
                        type="text"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.timezone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., UTC-5, EST"
                      />
                      {errors.timezone && (
                        <p className="text-red-600 text-sm mt-1">{errors.timezone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability Status *
                      </label>
                      <select
                        {...register('availability_status')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="available">Available for opportunities</option>
                        <option value="looking_for_projects">Looking for projects</option>
                        <option value="busy">Currently busy</option>
                        <option value="not_available">Not available</option>
                      </select>
                    </div>
                  </div>
                </Card>

                {/* Professional Information */}
                <Card>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Professional Summary
                      </label>
                      <textarea
                        {...register('professional_summary')}
                        rows={4}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.professional_summary ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Summarize your professional background, expertise, and goals"
                      />
                      <div className="flex justify-between items-center mt-1">
                        {errors.professional_summary ? (
                          <p className="text-red-600 text-sm">
                            {errors.professional_summary.message}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            {watchedFields.professional_summary?.length || 0} characters
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience & Background
                      </label>
                      <textarea
                        {...register('experience')}
                        rows={6}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.experience ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Detail your work experience, education, and relevant background"
                      />
                      {errors.experience && (
                        <p className="text-red-600 text-sm mt-1">{errors.experience.message}</p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Skills */}
                <Card>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Skills & Expertise</h2>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        placeholder="Add a skill..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <Button type="button" onClick={handleAddSkill} className="flex items-center gap-2">
                        <Plus size={18} />
                        Add
                      </Button>
                    </div>
                    {errors.skills && (
                      <p className="text-red-600 text-sm">{errors.skills.message}</p>
                    )}

                    <div className="space-y-3">
                      {watchedFields.skills.map((skill) => (
                        <div key={skill} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{skill}</p>
                            <select
                              value={watchedFields.skill_proficiencies[skill] || 'intermediate'}
                              onChange={(e) =>
                                handleSkillProficiencyChange(skill, e.target.value as any)
                              }
                              className="mt-1 text-sm px-2 py-1 border border-gray-300 rounded"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="expert">Expert</option>
                            </select>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Achievements */}
                <Card>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === 'Enter' && (e.preventDefault(), handleAddAchievement())
                        }
                        placeholder="Add an achievement..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <Button
                        type="button"
                        onClick={handleAddAchievement}
                        className="flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Add
                      </Button>
                    </div>
                    {errors.achievements && (
                      <p className="text-red-600 text-sm">{errors.achievements.message}</p>
                    )}

                    <ul className="space-y-2">
                      {watchedFields.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="flex-1 text-gray-700">{achievement}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveAchievement(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>

                {/* Social Links */}
                <Card>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Social & Portfolio Links</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn
                      </label>
                      <input
                        {...register('social_links.linkedin')}
                        type="url"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.social_links?.linkedin ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                      {errors.social_links?.linkedin && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.social_links.linkedin.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GitHub
                      </label>
                      <input
                        {...register('social_links.github')}
                        type="url"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.social_links?.github ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="https://github.com/yourusername"
                      />
                      {errors.social_links?.github && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.social_links.github.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Twitter
                      </label>
                      <input
                        {...register('social_links.twitter')}
                        type="url"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.social_links?.twitter ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="https://twitter.com/yourusername"
                      />
                      {errors.social_links?.twitter && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.social_links.twitter.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Portfolio Website
                      </label>
                      <input
                        {...register('social_links.portfolio')}
                        type="url"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.social_links?.portfolio ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="https://yourportfolio.com"
                      />
                      {errors.social_links?.portfolio && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.social_links.portfolio.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Personal Website
                      </label>
                      <input
                        {...register('social_links.website')}
                        type="url"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.social_links?.website ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="https://yourwebsite.com"
                      />
                      {errors.social_links?.website && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.social_links.website.message}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <ProfileCompletionIndicator
                  percentage={completion.percentage}
                  completedFields={completion.completedFields}
                  missingFields={completion.missingFields}
                />

                <Card>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
