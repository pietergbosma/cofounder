// Service layer for API calls
// TODO: Integrate with Supabase by:
// 1. Install Supabase client: pnpm add @supabase/supabase-js
// 2. Create supabaseClient.ts with your credentials
// 3. Replace mock data calls with Supabase queries

import {
  User,
  Project,
  Position,
  Application,
  ProjectMember,
  Review,
  MRRData,
  InvestmentRound,
  Investment,
  InvestorReview,
} from '../types';
import {
  mockUsers,
  mockProjects,
  mockPositions,
  mockApplications,
  mockProjectMembers,
  mockReviews,
  mockMRRData,
} from '../data/mockData';

// TODO: Uncomment when Supabase is integrated
// import { supabase } from './supabaseClient';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============= AUTH SERVICES =============
// TODO: Replace with Supabase Auth
export const authService = {
  async login(email: string, password: string): Promise<User> {
    await delay(500);
    // TODO: Replace with: const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    const user = mockUsers.find(u => u.email === email);
    if (!user) throw new Error('Invalid credentials');
    return user;
  },

  async signup(email: string, password: string, name: string, userType: 'founder' | 'investor' = 'founder'): Promise<User> {
    await delay(500);
    // TODO: Replace with: const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, user_type: userType } } })
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      bio: '',
      skills: [],
      experience: '',
      contact: '',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      created_at: new Date().toISOString(),
      user_type: userType,
    };
    mockUsers.push(newUser);
    return newUser;
  },

  async logout(): Promise<void> {
    await delay(300);
    // TODO: Replace with: await supabase.auth.signOut()
  },

  async getCurrentUser(): Promise<User | null> {
    // TODO: Replace with: const { data: { user } } = await supabase.auth.getUser()
    // For now, return first user as logged in
    return mockUsers[0];
  },
};

// ============= USER SERVICES =============
export const userService = {
  async getUserById(id: string): Promise<User | null> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
    return mockUsers.find(u => u.id === id) || null;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await delay(500);
    // TODO: Replace with: const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single()
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error('User not found');
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    return mockUsers[userIndex];
  },

  async getReviewsForUser(userId: string): Promise<Review[]> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('reviews').select('*, reviewer:users!reviewer_id(*), project:projects(*)').eq('reviewee_id', userId)
    return mockReviews
      .filter(r => r.reviewee_id === userId)
      .map(r => ({
        ...r,
        reviewer: mockUsers.find(u => u.id === r.reviewer_id),
        project: mockProjects.find(p => p.id === r.project_id),
      }));
  },
};

// ============= PROJECT SERVICES =============
export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('projects').select('*, owner:users(*)')
    return mockProjects.map(p => ({
      ...p,
      owner: mockUsers.find(u => u.id === p.owner_id),
    }));
  },

  async getProjectById(id: string): Promise<Project | null> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('projects').select('*, owner:users(*)').eq('id', id).single()
    const project = mockProjects.find(p => p.id === id);
    if (!project) return null;
    return {
      ...project,
      owner: mockUsers.find(u => u.id === project.owner_id),
    };
  },

  async getProjectsByOwner(ownerId: string): Promise<Project[]> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('projects').select('*').eq('owner_id', ownerId)
    return mockProjects.filter(p => p.owner_id === ownerId);
  },

  async createProject(project: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
    await delay(500);
    // TODO: Replace with: const { data, error } = await supabase.from('projects').insert(project).select().single()
    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    mockProjects.push(newProject);
    return newProject;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    await delay(500);
    // TODO: Replace with: const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single()
    const projectIndex = mockProjects.findIndex(p => p.id === id);
    if (projectIndex === -1) throw new Error('Project not found');
    mockProjects[projectIndex] = { ...mockProjects[projectIndex], ...updates };
    return mockProjects[projectIndex];
  },

  async deleteProject(id: string): Promise<void> {
    await delay(500);
    // TODO: Replace with: const { error } = await supabase.from('projects').delete().eq('id', id)
    const projectIndex = mockProjects.findIndex(p => p.id === id);
    if (projectIndex !== -1) {
      mockProjects.splice(projectIndex, 1);
    }
  },
};

// ============= POSITION SERVICES =============
export const positionService = {
  async getPositionsByProject(projectId: string): Promise<Position[]> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('positions').select('*').eq('project_id', projectId)
    return mockPositions.filter(p => p.project_id === projectId);
  },

  async getPositionById(id: string): Promise<Position | null> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('positions').select('*, project:projects(*, owner:users(*))').eq('id', id).single()
    const position = mockPositions.find(p => p.id === id);
    if (!position) return null;
    const project = mockProjects.find(p => p.id === position.project_id);
    return {
      ...position,
      project: project ? {
        ...project,
        owner: mockUsers.find(u => u.id === project.owner_id),
      } : undefined,
    };
  },

  async getAllOpenPositions(): Promise<Position[]> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('positions').select('*, project:projects(*, owner:users(*))').eq('status', 'open')
    return mockPositions
      .filter(p => p.status === 'open')
      .map(p => {
        const project = mockProjects.find(proj => proj.id === p.project_id);
        return {
          ...p,
          project: project ? {
            ...project,
            owner: mockUsers.find(u => u.id === project.owner_id),
          } : undefined,
        };
      });
  },

  async createPosition(position: Omit<Position, 'id' | 'created_at'>): Promise<Position> {
    await delay(500);
    // TODO: Replace with: const { data, error } = await supabase.from('positions').insert(position).select().single()
    const newPosition: Position = {
      ...position,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    mockPositions.push(newPosition);
    return newPosition;
  },

  async updatePosition(id: string, updates: Partial<Position>): Promise<Position> {
    await delay(500);
    // TODO: Replace with: const { data, error } = await supabase.from('positions').update(updates).eq('id', id).select().single()
    const positionIndex = mockPositions.findIndex(p => p.id === id);
    if (positionIndex === -1) throw new Error('Position not found');
    mockPositions[positionIndex] = { ...mockPositions[positionIndex], ...updates };
    return mockPositions[positionIndex];
  },

  async deletePosition(id: string): Promise<void> {
    await delay(500);
    // TODO: Replace with: const { error } = await supabase.from('positions').delete().eq('id', id)
    const positionIndex = mockPositions.findIndex(p => p.id === id);
    if (positionIndex !== -1) {
      mockPositions.splice(positionIndex, 1);
    }
  },
};

// ============= APPLICATION SERVICES =============
export const applicationService = {
  async getApplicationsByApplicant(applicantId: string): Promise<Application[]> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('applications').select('*, position:positions(*, project:projects(*))').eq('applicant_id', applicantId)
    return mockApplications
      .filter(a => a.applicant_id === applicantId)
      .map(a => {
        const position = mockPositions.find(p => p.id === a.position_id);
        return {
          ...a,
          position: position ? {
            ...position,
            project: mockProjects.find(proj => proj.id === position.project_id),
          } : undefined,
        };
      });
  },

  async getApplicationsByPosition(positionId: string): Promise<Application[]> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('applications').select('*, applicant:users(*)').eq('position_id', positionId)
    return mockApplications
      .filter(a => a.position_id === positionId)
      .map(a => ({
        ...a,
        applicant: mockUsers.find(u => u.id === a.applicant_id),
      }));
  },

  async getApplicationsByProject(projectId: string): Promise<Application[]> {
    await delay(300);
    // TODO: Replace with: Complex query joining applications -> positions -> projects
    const projectPositions = mockPositions.filter(p => p.project_id === projectId);
    const positionIds = projectPositions.map(p => p.id);
    return mockApplications
      .filter(a => positionIds.includes(a.position_id))
      .map(a => {
        const position = mockPositions.find(p => p.id === a.position_id);
        return {
          ...a,
          position,
          applicant: mockUsers.find(u => u.id === a.applicant_id),
        };
      });
  },

  async createApplication(application: Omit<Application, 'id' | 'created_at' | 'status'>): Promise<Application> {
    await delay(500);
    // TODO: Replace with: const { data, error } = await supabase.from('applications').insert({ ...application, status: 'pending' }).select().single()
    const newApplication: Application = {
      ...application,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    mockApplications.push(newApplication);
    return newApplication;
  },

  async updateApplicationStatus(id: string, status: 'accepted' | 'rejected'): Promise<Application> {
    await delay(500);
    // TODO: Replace with: const { data, error } = await supabase.from('applications').update({ status }).eq('id', id).select().single()
    const appIndex = mockApplications.findIndex(a => a.id === id);
    if (appIndex === -1) throw new Error('Application not found');
    mockApplications[appIndex].status = status;
    
    // If accepted, add to project members
    if (status === 'accepted') {
      const application = mockApplications[appIndex];
      const position = mockPositions.find(p => p.id === application.position_id);
      if (position) {
        const newMember: ProjectMember = {
          id: Math.random().toString(36).substr(2, 9),
          project_id: position.project_id,
          user_id: application.applicant_id,
          role: position.title,
          joined_at: new Date().toISOString(),
        };
        mockProjectMembers.push(newMember);
      }
    }
    
    return mockApplications[appIndex];
  },
};

// ============= PROJECT MEMBER SERVICES =============
export const projectMemberService = {
  async getMembersByProject(projectId: string): Promise<ProjectMember[]> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('project_members').select('*, user:users(*), project:projects(*)').eq('project_id', projectId)
    return mockProjectMembers
      .filter(m => m.project_id === projectId)
      .map(m => ({
        ...m,
        user: mockUsers.find(u => u.id === m.user_id),
        project: mockProjects.find(p => p.id === m.project_id),
      }));
  },

  async getMembersByUser(userId: string): Promise<ProjectMember[]> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('project_members').select('*, project:projects(*)').eq('user_id', userId)
    return mockProjectMembers
      .filter(m => m.user_id === userId)
      .map(m => ({
        ...m,
        project: mockProjects.find(p => p.id === m.project_id),
      }));
  },
};

// ============= REVIEW SERVICES =============
export const reviewService = {
  async getReviewsForUser(userId: string): Promise<Review[]> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('reviews').select('*, reviewer:users!reviewer_id(*), project:projects(*)').eq('reviewee_id', userId)
    return mockReviews
      .filter(r => r.reviewee_id === userId)
      .map(r => ({
        ...r,
        reviewer: mockUsers.find(u => u.id === r.reviewer_id),
        project: mockProjects.find(p => p.id === r.project_id),
      }));
  },

  async createReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    await delay(500);
    // TODO: Replace with: const { data, error } = await supabase.from('reviews').insert(review).select().single()
    const newReview: Review = {
      ...review,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    mockReviews.push(newReview);
    
    // Update user's average rating
    const userReviews = mockReviews.filter(r => r.reviewee_id === review.reviewee_id);
    const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    const userIndex = mockUsers.findIndex(u => u.id === review.reviewee_id);
    if (userIndex !== -1) {
      mockUsers[userIndex].average_rating = Math.round(avgRating * 10) / 10;
    }
    
    return newReview;
  },
};

// ============= MRR SERVICES =============
export const mrrService = {
  async getMRRByProject(projectId: string): Promise<MRRData[]> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('mrr_data').select('*').eq('project_id', projectId).order('month', { ascending: true })
    return mockMRRData
      .filter(m => m.project_id === projectId)
      .sort((a, b) => a.month.localeCompare(b.month));
  },

  async getMRRByUser(userId: string): Promise<{ projectId: string; projectTitle: string; data: MRRData[] }[]> {
    await delay(300);
    // TODO: Replace with: Complex query to get MRR for all projects user is involved in
    const userProjects = mockProjectMembers
      .filter(m => m.user_id === userId)
      .map(m => m.project_id);
    
    return userProjects.map(projectId => {
      const project = mockProjects.find(p => p.id === projectId);
      const data = mockMRRData
        .filter(m => m.project_id === projectId)
        .sort((a, b) => a.month.localeCompare(b.month));
      return {
        projectId,
        projectTitle: project?.title || 'Unknown Project',
        data,
      };
    });
  },

  async addMRRData(mrrData: Omit<MRRData, 'id' | 'created_at'>): Promise<MRRData> {
    await delay(500);
    // TODO: This would typically be handled by a Stripe webhook edge function
    // const { data, error } = await supabase.from('mrr_data').insert(mrrData).select().single()
    const newMRR: MRRData = {
      ...mrrData,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    mockMRRData.push(newMRR);
    return newMRR;
  },
};


// ============= INVESTMENT ROUND SERVICES =============
export const investmentRoundService = {
  async getInvestmentRounds(projectId?: string): Promise<InvestmentRound[]> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('investment_rounds').select('*, project:projects(*)').eq(projectId ? 'project_id' : null, projectId)
    const { mockInvestmentRounds } = await import('../data/mockData');
    const rounds = projectId 
      ? mockInvestmentRounds.filter(r => r.project_id === projectId)
      : mockInvestmentRounds;
    
    return rounds.map(r => ({
      ...r,
      project: mockProjects.find(p => p.id === r.project_id),
    }));
  },

  async getInvestmentRoundById(id: string): Promise<InvestmentRound | null> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('investment_rounds').select('*, project:projects(*)').eq('id', id).single()
    const { mockInvestmentRounds } = await import('../data/mockData');
    const round = mockInvestmentRounds.find(r => r.id === id);
    if (!round) return null;
    
    return {
      ...round,
      project: mockProjects.find(p => p.id === round.project_id),
    };
  },

  async createInvestmentRound(round: Omit<InvestmentRound, 'id' | 'created_at'>): Promise<InvestmentRound> {
    await delay(500);
    // TODO: Replace with: const { data, error } = await supabase.from('investment_rounds').insert(round).select().single()
    const { mockInvestmentRounds } = await import('../data/mockData');
    const newRound: InvestmentRound = {
      ...round,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    mockInvestmentRounds.push(newRound);
    return newRound;
  },

  async updateInvestmentRound(id: string, updates: Partial<InvestmentRound>): Promise<InvestmentRound> {
    await delay(500);
    // TODO: Replace with: const { data, error } = await supabase.from('investment_rounds').update(updates).eq('id', id).select().single()
    const { mockInvestmentRounds } = await import('../data/mockData');
    const roundIndex = mockInvestmentRounds.findIndex(r => r.id === id);
    if (roundIndex === -1) throw new Error('Investment round not found');
    mockInvestmentRounds[roundIndex] = { ...mockInvestmentRounds[roundIndex], ...updates };
    return mockInvestmentRounds[roundIndex];
  },

  async getOpenRounds(filters?: { category?: string; minAmount?: number; maxAmount?: number }): Promise<InvestmentRound[]> {
    await delay(300);
    // TODO: Replace with Supabase query with filters
    const { mockInvestmentRounds } = await import('../data/mockData');
    let rounds = mockInvestmentRounds.filter(r => r.status === 'open');
    
    if (filters?.category) {
      rounds = rounds.filter(r => {
        const project = mockProjects.find(p => p.id === r.project_id);
        return project?.category === filters.category;
      });
    }
    
    if (filters?.minAmount) {
      rounds = rounds.filter(r => r.amount_seeking >= filters.minAmount!);
    }
    
    if (filters?.maxAmount) {
      rounds = rounds.filter(r => r.amount_seeking <= filters.maxAmount!);
    }
    
    return rounds.map(r => ({
      ...r,
      project: mockProjects.find(p => p.id === r.project_id),
    }));
  },
};

// ============= INVESTMENT SERVICES =============
export const investmentService = {
  async getInvestments(roundId?: string, investorId?: string): Promise<Investment[]> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('investments').select('*, round:investment_rounds(*), investor:users(*)').eq(roundId ? 'round_id' : null, roundId).eq(investorId ? 'investor_id' : null, investorId)
    const { mockInvestments, mockInvestmentRounds, allUsers } = await import('../data/mockData');
    let investments = mockInvestments;
    
    if (roundId) {
      investments = investments.filter(i => i.round_id === roundId);
    }
    
    if (investorId) {
      investments = investments.filter(i => i.investor_id === investorId);
    }
    
    return investments.map(i => ({
      ...i,
      round: mockInvestmentRounds.find(r => r.id === i.round_id),
      investor: allUsers.find(u => u.id === i.investor_id),
    }));
  },

  async createInvestment(investment: Omit<Investment, 'id' | 'date'>): Promise<Investment> {
    await delay(500);
    // TODO: Replace with: const { data, error } = await supabase.from('investments').insert(investment).select().single()
    const { mockInvestments } = await import('../data/mockData');
    const newInvestment: Investment = {
      ...investment,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    mockInvestments.push(newInvestment);
    return newInvestment;
  },

  async updateInvestmentStatus(id: string, status: 'pending' | 'confirmed'): Promise<Investment> {
    await delay(500);
    // TODO: Replace with: const { data, error } = await supabase.from('investments').update({ status }).eq('id', id).select().single()
    const { mockInvestments } = await import('../data/mockData');
    const investmentIndex = mockInvestments.findIndex(i => i.id === id);
    if (investmentIndex === -1) throw new Error('Investment not found');
    mockInvestments[investmentIndex].status = status;
    return mockInvestments[investmentIndex];
  },

  async getInvestorPortfolio(investorId: string): Promise<{
    investments: Investment[];
    totalInvested: number;
    portfolioCount: number;
  }> {
    await delay(300);
    // TODO: Replace with Supabase aggregation query
    const { mockInvestments, mockInvestmentRounds, allUsers } = await import('../data/mockData');
    const investments = mockInvestments
      .filter(i => i.investor_id === investorId && i.status === 'confirmed')
      .map(i => ({
        ...i,
        round: mockInvestmentRounds.find(r => r.id === i.round_id),
        investor: allUsers.find(u => u.id === i.investor_id),
      }));
    
    const totalInvested = investments.reduce((sum, i) => sum + i.amount_invested, 0);
    const uniqueProjects = new Set(investments.map(i => i.round?.project_id));
    
    return {
      investments,
      totalInvested,
      portfolioCount: uniqueProjects.size,
    };
  },
};

// ============= INVESTOR REVIEW SERVICES =============
export const investorReviewService = {
  async getInvestorReviews(investorId: string): Promise<InvestorReview[]> {
    await delay(300);
    // TODO: Replace with: const { data, error } = await supabase.from('investor_reviews').select('*, reviewer:users!reviewer_id(*), investor:users!investor_id(*), project:projects(*)').eq('investor_id', investorId)
    const { mockInvestorReviews, allUsers } = await import('../data/mockData');
    return mockInvestorReviews
      .filter(r => r.investor_id === investorId)
      .map(r => ({
        ...r,
        reviewer: allUsers.find(u => u.id === r.reviewer_id),
        investor: allUsers.find(u => u.id === r.investor_id),
        project: mockProjects.find(p => p.id === r.project_id),
      }));
  },

  async createInvestorReview(review: Omit<InvestorReview, 'id' | 'created_at'>): Promise<InvestorReview> {
    await delay(500);
    // TODO: Replace with: const { data, error } = await supabase.from('investor_reviews').insert(review).select().single()
    const { mockInvestorReviews } = await import('../data/mockData');
    const newReview: InvestorReview = {
      ...review,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    mockInvestorReviews.push(newReview);
    return newReview;
  },

  async getAverageInvestorRating(investorId: string): Promise<number> {
    await delay(200);
    // TODO: Replace with: Supabase aggregate query
    const { mockInvestorReviews } = await import('../data/mockData');
    const reviews = mockInvestorReviews.filter(r => r.investor_id === investorId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  },
};
