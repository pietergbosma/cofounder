// Type definitions for the co-founders marketplace platform

export interface User {
  id: string;
  email: string;
  name: string;
  bio: string;
  skills: string[];
  experience: string;
  contact: string;
  avatar_url: string;
  created_at: string;
  average_rating?: number;
  user_type: 'founder' | 'investor';
  // Investor-specific fields
  investment_focus?: string[];
  investment_range_min?: number;
  investment_range_max?: number;
  portfolio_size?: number;
}

export interface Project {
  id: string;
  owner_id: string;
  owner?: User;
  title: string;
  description: string;
  category: string;
  website: string;
  created_at: string;
}

export interface Position {
  id: string;
  project_id: string;
  project?: Project;
  title: string;
  description: string;
  requirements: string;
  status: 'open' | 'closed';
  created_at: string;
}

export interface Application {
  id: string;
  position_id: string;
  position?: Position;
  applicant_id: string;
  applicant?: User;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  project?: Project;
  user_id: string;
  user?: User;
  role: string;
  joined_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewer?: User;
  reviewee_id: string;
  reviewee?: User;
  project_id: string;
  project?: Project;
  rating: number;
  comment: string;
  created_at: string;
}

export interface MRRData {
  id: string;
  project_id: string;
  project?: Project;
  month: string;
  revenue: number;
  created_at: string;
}

export interface InvestmentRound {
  id: string;
  project_id: string;
  project?: Project;
  round_name: string;
  amount_seeking: number;
  amount_raised: number;
  valuation: number;
  equity_offered: number;
  min_investment: number;
  max_investment: number;
  description: string;
  terms: string;
  status: 'open' | 'closed';
  deadline: string;
  created_at: string;
}

export interface Investment {
  id: string;
  round_id: string;
  round?: InvestmentRound;
  investor_id: string;
  investor?: User;
  amount_invested: number;
  date: string;
  status: 'pending' | 'confirmed';
  notes: string;
}

export interface InvestorReview {
  id: string;
  reviewer_id: string;
  reviewer?: User;
  investor_id: string;
  investor?: User;
  project_id: string;
  project?: Project;
  rating: number;
  comment: string;
  helpful: boolean;
  responsive: boolean;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, userType: 'founder' | 'investor') => Promise<void>;
  logout: () => void;
}
