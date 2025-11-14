-- Profile Enhancement Database Migration
-- Run this in your Supabase SQL Editor after the main schema

-- Add new profile fields for enhanced profile system
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS availability_status TEXT CHECK (availability_status IN ('available', 'looking_for_projects', 'busy', 'not_available')) DEFAULT 'available',
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS professional_summary TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS portfolio_projects JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create function to calculate profile completion
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_fields INTEGER := 10; -- Total number of important fields
  completed_fields INTEGER := 0;
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM public.profiles WHERE id = user_id;
  
  IF profile_record.name IS NOT NULL AND profile_record.name != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.experience IS NOT NULL AND profile_record.experience != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.skills IS NOT NULL AND array_length(profile_record.skills, 1) > 0 THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.professional_summary IS NOT NULL AND profile_record.professional_summary != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.achievements IS NOT NULL AND array_length(profile_record.achievements, 1) > 0 THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.social_links IS NOT NULL AND profile_record.social_links != '{}' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.location IS NOT NULL AND profile_record.location != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.availability_status IS NOT NULL THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.avatar_url IS NOT NULL AND profile_record.avatar_url != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  RETURN ROUND((completed_fields::DECIMAL / total_fields::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update profile completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_percentage := calculate_profile_completion(NEW.id);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update completion percentage
DROP TRIGGER IF EXISTS update_profile_completion_trigger ON public.profiles;
CREATE TRIGGER update_profile_completion_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- Update existing profiles with completion percentages
UPDATE public.profiles 
SET profile_completion_percentage = calculate_profile_completion(id),
    updated_at = NOW();

-- Create storage bucket for profile images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_completion_percentage ON public.profiles(profile_completion_percentage);
CREATE INDEX IF NOT EXISTS idx_profiles_availability_status ON public.profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);