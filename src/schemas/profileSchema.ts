import { z } from 'zod';

// URL validation with optional protocol
const urlSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      try {
        // Allow URLs with or without protocol
        const urlToTest = val.startsWith('http') ? val : `https://${val}`;
        new URL(urlToTest);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Please enter a valid URL' }
  );

export const profileEditSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  bio: z
    .string()
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio must be less than 500 characters'),
  
  professional_summary: z
    .string()
    .min(20, 'Professional summary must be at least 20 characters')
    .max(1000, 'Professional summary must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  
  experience: z
    .string()
    .min(20, 'Experience must be at least 20 characters')
    .max(2000, 'Experience must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  
  location: z
    .string()
    .max(100, 'Location must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  
  timezone: z
    .string()
    .max(50, 'Timezone must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  
  availability_status: z.enum(['available', 'looking_for_projects', 'busy', 'not_available']),
  
  skills: z
    .array(z.string())
    .min(1, 'Add at least one skill')
    .max(20, 'Maximum 20 skills allowed'),
  
  skill_proficiencies: z.record(z.enum(['beginner', 'intermediate', 'advanced', 'expert'])),
  
  achievements: z.array(z.string()).max(10, 'Maximum 10 achievements allowed'),
  
  social_links: z.object({
    linkedin: urlSchema,
    github: urlSchema,
    twitter: urlSchema,
    portfolio: urlSchema,
    website: urlSchema,
  }),
});

export type ProfileEditFormData = z.infer<typeof profileEditSchema>;
