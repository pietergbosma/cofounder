-- CoFounder Hub Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
-- Note: Supabase Auth handles the auth.users table
-- This extends user profiles
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  experience TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  average_rating NUMERIC(3,2) DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  website TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- POSITIONS TABLE
-- ============================================
CREATE TABLE public.positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(position_id, applicant_id)
);

-- ============================================
-- PROJECT MEMBERS TABLE
-- ============================================
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reviewer_id, reviewee_id, project_id)
);

-- ============================================
-- MRR DATA TABLE
-- ============================================
CREATE TABLE public.mrr_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM
  revenue INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, month)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_projects_owner ON public.projects(owner_id);
CREATE INDEX idx_positions_project ON public.positions(project_id);
CREATE INDEX idx_positions_status ON public.positions(status);
CREATE INDEX idx_applications_position ON public.applications(position_id);
CREATE INDEX idx_applications_applicant ON public.applications(applicant_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_project_members_project ON public.project_members(project_id);
CREATE INDEX idx_project_members_user ON public.project_members(user_id);
CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX idx_mrr_project ON public.mrr_data(project_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mrr_data ENABLE ROW LEVEL SECURITY;

-- Users: Can read all, update own
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects: Can read all, manage own
CREATE POLICY "Anyone can view projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = owner_id);

-- Positions: Can read all, manage own project's positions
CREATE POLICY "Anyone can view open positions" ON public.positions
  FOR SELECT USING (true);

CREATE POLICY "Project owners can create positions" ON public.positions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update positions" ON public.positions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete positions" ON public.positions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND owner_id = auth.uid()
    )
  );

-- Applications: Can read own and project owner can read theirs
CREATE POLICY "Users can view own applications" ON public.applications
  FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Project owners can view applications" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.positions p
      JOIN public.projects pr ON pr.id = p.project_id
      WHERE p.id = position_id AND pr.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Project owners can update applications" ON public.applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.positions p
      JOIN public.projects pr ON pr.id = p.project_id
      WHERE p.id = position_id AND pr.owner_id = auth.uid()
    )
  );

-- Project Members: Can read all, project owner manages
CREATE POLICY "Anyone can view project members" ON public.project_members
  FOR SELECT USING (true);

CREATE POLICY "Project owners can add members" ON public.project_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can remove members" ON public.project_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND owner_id = auth.uid()
    )
  );

-- Reviews: Can read all, create for projects you're part of
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Project members can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = reviews.project_id AND user_id = auth.uid()
    )
  );

-- MRR Data: Can read if involved in project
CREATE POLICY "Project owners and members can view MRR" ON public.mrr_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND owner_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = mrr_data.project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert MRR data" ON public.mrr_data
  FOR INSERT WITH CHECK (true); -- This will be handled by edge functions

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update average rating
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET average_rating = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM public.reviews
    WHERE reviewee_id = NEW.reviewee_id
  )
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating after review
CREATE TRIGGER update_rating_after_review
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_user_rating();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON public.positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SAMPLE DATA (OPTIONAL)
-- ============================================
-- Uncomment to add sample data after setting up authentication
/*
-- Insert sample users (after they sign up through Supabase Auth)
INSERT INTO public.users (id, email, name, bio, skills, experience, contact, avatar_url) VALUES
  ('user-id-1', 'sarah.chen@email.com', 'Sarah Chen', 'Full-stack developer...', 
   ARRAY['React', 'Node.js', 'Python'], '8 years in software engineering', 'linkedin.com/in/sarahchen',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah');
*/
