-- Complete Database Schema for Co-Founders Marketplace with Investor Features
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & PROFILES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  experience TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('founder', 'investor')) NOT NULL DEFAULT 'founder',
  
  -- Investor-specific fields
  investment_focus TEXT[] DEFAULT '{}',
  investment_range_min INTEGER,
  investment_range_max INTEGER,
  portfolio_size INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  website TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- POSITIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT DEFAULT '',
  status TEXT CHECK (status IN ('open', 'closed')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPLICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECT MEMBERS
-- ============================================

CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- ============================================
-- REVIEWS (Founder Reviews)
-- ============================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVESTMENT ROUNDS
-- ============================================

CREATE TABLE IF NOT EXISTS public.investment_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  round_name TEXT NOT NULL,
  amount_seeking INTEGER NOT NULL,
  amount_raised INTEGER DEFAULT 0,
  valuation INTEGER NOT NULL,
  equity_offered NUMERIC(5,2) NOT NULL,
  min_investment INTEGER NOT NULL,
  max_investment INTEGER NOT NULL,
  description TEXT NOT NULL,
  terms TEXT NOT NULL,
  status TEXT CHECK (status IN ('open', 'closed')) DEFAULT 'open',
  deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVESTMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES public.investment_rounds(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_invested INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed')) DEFAULT 'pending',
  notes TEXT DEFAULT '',
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVESTOR REVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS public.investor_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT NOT NULL,
  helpful BOOLEAN DEFAULT false,
  responsive BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MRR DATA (Stripe Integration)
-- ============================================

CREATE TABLE IF NOT EXISTS public.mrr_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  revenue INTEGER NOT NULL,
  stripe_subscription_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, month)
);

-- ============================================
-- STRIPE SUBSCRIPTIONS (for MRR tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_positions_project ON public.positions(project_id);
CREATE INDEX IF NOT EXISTS idx_positions_status ON public.positions(status);
CREATE INDEX IF NOT EXISTS idx_applications_position ON public.applications(position_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_investment_rounds_project ON public.investment_rounds(project_id);
CREATE INDEX IF NOT EXISTS idx_investment_rounds_status ON public.investment_rounds(status);
CREATE INDEX IF NOT EXISTS idx_investments_round ON public.investments(round_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON public.investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_reviews_investor ON public.investor_reviews(investor_id);
CREATE INDEX IF NOT EXISTS idx_mrr_data_project ON public.mrr_data(project_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_project ON public.stripe_subscriptions(project_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mrr_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Projects: Everyone can view, only owner can update/delete
CREATE POLICY "Projects are viewable by everyone" 
  ON public.projects FOR SELECT 
  USING (true);

CREATE POLICY "Users can create projects" 
  ON public.projects FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects" 
  ON public.projects FOR UPDATE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects" 
  ON public.projects FOR DELETE 
  USING (auth.uid() = owner_id);

-- Positions: Everyone can view open positions
CREATE POLICY "Open positions are viewable by everyone" 
  ON public.positions FOR SELECT 
  USING (true);

CREATE POLICY "Project owners can manage positions" 
  ON public.positions FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = positions.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Applications: Applicants and project owners can view
CREATE POLICY "Users can view own applications" 
  ON public.applications FOR SELECT 
  USING (
    auth.uid() = applicant_id 
    OR EXISTS (
      SELECT 1 FROM public.positions p
      JOIN public.projects proj ON p.project_id = proj.id
      WHERE p.id = applications.position_id 
      AND proj.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create applications" 
  ON public.applications FOR INSERT 
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Project owners can update applications" 
  ON public.applications FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.positions p
      JOIN public.projects proj ON p.project_id = proj.id
      WHERE p.id = applications.position_id 
      AND proj.owner_id = auth.uid()
    )
  );

-- Project Members: Everyone can view
CREATE POLICY "Project members are viewable by everyone" 
  ON public.project_members FOR SELECT 
  USING (true);

CREATE POLICY "Project owners can manage members" 
  ON public.project_members FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_members.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Reviews: Everyone can view, project members can create
CREATE POLICY "Reviews are viewable by everyone" 
  ON public.reviews FOR SELECT 
  USING (true);

CREATE POLICY "Project members can create reviews" 
  ON public.reviews FOR INSERT 
  WITH CHECK (
    auth.uid() = reviewer_id 
    AND EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_members.project_id = reviews.project_id 
      AND project_members.user_id = auth.uid()
    )
  );

-- Investment Rounds: Everyone can view, project owners can manage
CREATE POLICY "Investment rounds are viewable by everyone" 
  ON public.investment_rounds FOR SELECT 
  USING (true);

CREATE POLICY "Project owners can manage investment rounds" 
  ON public.investment_rounds FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = investment_rounds.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Investments: Investors and project owners can view
CREATE POLICY "Users can view relevant investments" 
  ON public.investments FOR SELECT 
  USING (
    auth.uid() = investor_id 
    OR EXISTS (
      SELECT 1 FROM public.investment_rounds ir
      JOIN public.projects proj ON ir.project_id = proj.id
      WHERE ir.id = investments.round_id 
      AND proj.owner_id = auth.uid()
    )
  );

CREATE POLICY "Investors can create investments" 
  ON public.investments FOR INSERT 
  WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Project owners can update investment status" 
  ON public.investments FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.investment_rounds ir
      JOIN public.projects proj ON ir.project_id = proj.id
      WHERE ir.id = investments.round_id 
      AND proj.owner_id = auth.uid()
    )
  );

-- Investor Reviews: Everyone can view, founders who received investments can create
CREATE POLICY "Investor reviews are viewable by everyone" 
  ON public.investor_reviews FOR SELECT 
  USING (true);

CREATE POLICY "Founders can review investors" 
  ON public.investor_reviews FOR INSERT 
  WITH CHECK (
    auth.uid() = reviewer_id 
    AND EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = investor_reviews.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- MRR Data: Everyone can view, project owners can manage
CREATE POLICY "MRR data is viewable by everyone" 
  ON public.mrr_data FOR SELECT 
  USING (true);

CREATE POLICY "Project owners can manage MRR data" 
  ON public.mrr_data FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = mrr_data.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Stripe Subscriptions: Only project owners can view/manage
CREATE POLICY "Project owners can view stripe subscriptions" 
  ON public.stripe_subscriptions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = stripe_subscriptions.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "System can insert stripe subscriptions" 
  ON public.stripe_subscriptions FOR INSERT 
  WITH CHECK (true); -- Will be called from Edge Function with service role

CREATE POLICY "System can update stripe subscriptions" 
  ON public.stripe_subscriptions FOR UPDATE 
  USING (true); -- Will be called from Edge Function with service role

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_rounds_updated_at BEFORE UPDATE ON public.investment_rounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_subscriptions_updated_at BEFORE UPDATE ON public.stripe_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update investment round amount_raised
CREATE OR REPLACE FUNCTION update_investment_round_raised()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' THEN
    UPDATE public.investment_rounds
    SET amount_raised = amount_raised + NEW.amount_invested
    WHERE id = NEW.round_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update amount_raised when investment is confirmed
CREATE TRIGGER update_round_on_investment_confirmed 
  AFTER INSERT OR UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION update_investment_round_raised();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'founder')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
