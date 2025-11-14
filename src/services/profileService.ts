import { User } from '../types';

export const profileService = {
  calculateProfileCompletion: (user: User): {
    percentage: number;
    completedFields: string[];
    missingFields: string[];
  } => {
    const requiredFields = [
      { key: 'name', label: 'Name', check: () => !!user.name },
      { key: 'bio', label: 'Bio', check: () => !!user.bio && user.bio.length > 10 },
      { key: 'avatar_url', label: 'Profile Picture', check: () => !!user.avatar_url },
      { key: 'skills', label: 'Skills (at least 3)', check: () => user.skills.length >= 3 },
      { key: 'experience', label: 'Experience', check: () => !!user.experience && user.experience.length > 20 },
      { key: 'professional_summary', label: 'Professional Summary', check: () => !!user.professional_summary && user.professional_summary.length > 20 },
      { key: 'location', label: 'Location', check: () => !!user.location },
      { key: 'availability_status', label: 'Availability Status', check: () => !!user.availability_status },
      { key: 'social_links', label: 'At least one social link', check: () => {
        if (!user.social_links) return false;
        return Object.values(user.social_links).some(link => !!link);
      }},
    ];

    const completedFields: string[] = [];
    const missingFields: string[] = [];

    requiredFields.forEach((field) => {
      if (field.check()) {
        completedFields.push(field.label);
      } else {
        missingFields.push(field.label);
      }
    });

    const percentage = Math.round((completedFields.length / requiredFields.length) * 100);

    return {
      percentage,
      completedFields,
      missingFields,
    };
  },

  getAvailabilityLabel: (status?: string): string => {
    const labels: { [key: string]: string } = {
      available: 'Available for opportunities',
      looking_for_projects: 'Looking for projects',
      busy: 'Currently busy',
      not_available: 'Not available',
    };
    return status ? labels[status] || 'Not set' : 'Not set';
  },

  getAvailabilityColor: (status?: string): string => {
    const colors: { [key: string]: string } = {
      available: 'bg-green-100 text-green-800',
      looking_for_projects: 'bg-blue-100 text-blue-800',
      busy: 'bg-yellow-100 text-yellow-800',
      not_available: 'bg-gray-100 text-gray-800',
    };
    return status ? colors[status] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';
  },

  formatSkillsWithProficiency: (user: User): { name: string; proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' }[] => {
    return user.skills.map(skill => ({
      name: skill,
      proficiency: user.skill_proficiencies?.[skill] || 'intermediate' as 'intermediate',
    }));
  },
};
