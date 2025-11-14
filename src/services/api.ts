// Service layer for Supabase API calls
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
import { supabase } from '../lib/supabaseClient';

// ============= AUTH SERVICES =============
export const authService = {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error) throw error;

    if (!data.user) throw new Error('Login failed');

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');

    return profile as User;
  },

  async signup(
    email: string, 
    password: string, 
    name: string, 
    userType: 'founder' | 'investor' = 'founder'
  ): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          user_type: userType
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Signup failed');

    // Wait for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Fetch created profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile creation failed');

    return profile as User;
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return profile as User | null;
    } catch (err) {
      console.error('Failed to get current user:', err);
      return null;
    }
  },
};

// ============= USER SERVICES =============
export const userService = {
  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return data as User | null;
    } catch (err) {
      console.error('Failed to fetch user:', err);
      return null;
    }
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    // Verify authentication
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser || currentUser.id !== id) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Update failed');

    return data as User;
  },

  async getReviewsForUser(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) return [];

    // Manually fetch reviewer and project data
    const reviewerIds = [...new Set(data.map(r => r.reviewer_id))];
    const projectIds = [...new Set(data.map(r => r.project_id))];

    const [reviewersResult, projectsResult] = await Promise.all([
      supabase.from('profiles').select('*').in('id', reviewerIds),
      supabase.from('projects').select('*').in('id', projectIds)
    ]);

    const reviewers = reviewersResult.data || [];
    const projects = projectsResult.data || [];

    return data.map(r => ({
      ...r,
      reviewer: reviewers.find(u => u.id === r.reviewer_id),
      project: projects.find(p => p.id === r.project_id),
    })) as Review[];
  },
};

// ============= PROJECT SERVICES =============
export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Manually fetch owner data
    const ownerIds = [...new Set(data.map(p => p.owner_id))];
    const { data: owners } = await supabase
      .from('profiles')
      .select('*')
      .in('id', ownerIds);

    return data.map(p => ({
      ...p,
      owner: owners?.find(u => u.id === p.owner_id),
    })) as Project[];
  },

  async getProjectById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }

    if (!data) return null;

    // Fetch owner
    const { data: owner } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.owner_id)
      .maybeSingle();

    return {
      ...data,
      owner,
    } as Project;
  },

  async getProjectsByOwner(ownerId: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return [];
      }
      return (data || []) as Project[];
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      return [];
    }
  },

  async createProject(project: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Create failed');

    return data as Project;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Update failed');

    return data as Project;
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============= POSITION SERVICES =============
export const positionService = {
  async getPositionsByProject(projectId: string): Promise<Position[]> {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Position[];
  },

  async getPositionById(id: string): Promise<Position | null> {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching position:', error);
      return null;
    }

    if (!data) return null;

    // Fetch project and owner
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', data.project_id)
      .maybeSingle();

    if (project) {
      const { data: owner } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', project.owner_id)
        .maybeSingle();

      return {
        ...data,
        project: {
          ...project,
          owner,
        },
      } as Position;
    }

    return data as Position;
  },

  async getAllOpenPositions(): Promise<Position[]> {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Fetch projects and owners
    const projectIds = [...new Set(data.map(p => p.project_id))];
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds);

    if (!projects || projects.length === 0) {
      return data.map(p => ({ ...p, project: undefined })) as Position[];
    }

    const ownerIds = [...new Set(projects.map(p => p.owner_id))];
    const { data: owners } = await supabase
      .from('profiles')
      .select('*')
      .in('id', ownerIds);

    const projectsWithOwners = projects.map(p => ({
      ...p,
      owner: owners?.find(u => u.id === p.owner_id),
    }));

    return data.map(p => ({
      ...p,
      project: projectsWithOwners.find(proj => proj.id === p.project_id),
    })) as Position[];
  },

  async createPosition(position: Omit<Position, 'id' | 'created_at'>): Promise<Position> {
    const { data, error } = await supabase
      .from('positions')
      .insert(position)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Create failed');

    return data as Position;
  },

  async updatePosition(id: string, updates: Partial<Position>): Promise<Position> {
    const { data, error } = await supabase
      .from('positions')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Update failed');

    return data as Position;
  },

  async deletePosition(id: string): Promise<void> {
    const { error } = await supabase
      .from('positions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============= APPLICATION SERVICES =============
export const applicationService = {
  async getApplicationsByApplicant(applicantId: string): Promise<Application[]> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('applicant_id', applicantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        return [];
      }
      if (!data || data.length === 0) return [];

      // Fetch positions and projects
      const positionIds = [...new Set(data.map(a => a.position_id))];
      const { data: positions } = await supabase
        .from('positions')
        .select('*')
        .in('id', positionIds);

      if (!positions || positions.length === 0) {
        return data.map(a => ({ ...a, position: undefined })) as Application[];
      }

      const projectIds = [...new Set(positions.map(p => p.project_id))];
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .in('id', projectIds);

      const positionsWithProjects = positions.map(p => ({
        ...p,
        project: projects?.find(proj => proj.id === p.project_id),
      }));

      return data.map(a => ({
        ...a,
        position: positionsWithProjects.find(p => p.id === a.position_id),
      })) as Application[];
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      return [];
    }
  },

  async getApplicationsByPosition(positionId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('position_id', positionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Fetch applicants
    const applicantIds = [...new Set(data.map(a => a.applicant_id))];
    const { data: applicants } = await supabase
      .from('profiles')
      .select('*')
      .in('id', applicantIds);

    return data.map(a => ({
      ...a,
      applicant: applicants?.find(u => u.id === a.applicant_id),
    })) as Application[];
  },

  async getApplicationsByProject(projectId: string): Promise<Application[]> {
    // First get positions for this project
    const { data: positions } = await supabase
      .from('positions')
      .select('id')
      .eq('project_id', projectId);

    if (!positions || positions.length === 0) return [];

    const positionIds = positions.map(p => p.id);

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .in('position_id', positionIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Fetch applicants and full positions
    const applicantIds = [...new Set(data.map(a => a.applicant_id))];
    const [applicantsResult, positionsResult] = await Promise.all([
      supabase.from('profiles').select('*').in('id', applicantIds),
      supabase.from('positions').select('*').in('id', positionIds)
    ]);

    return data.map(a => ({
      ...a,
      applicant: applicantsResult.data?.find(u => u.id === a.applicant_id),
      position: positionsResult.data?.find(p => p.id === a.position_id),
    })) as Application[];
  },

  async createApplication(
    application: Omit<Application, 'id' | 'created_at' | 'status'>
  ): Promise<Application> {
    const { data, error } = await supabase
      .from('applications')
      .insert({ ...application, status: 'pending' })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Create failed');

    return data as Application;
  },

  async updateApplicationStatus(
    id: string, 
    status: 'accepted' | 'rejected'
  ): Promise<Application> {
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Update failed');

    // If accepted, add to project members
    if (status === 'accepted') {
      const { data: position } = await supabase
        .from('positions')
        .select('project_id, title')
        .eq('id', data.position_id)
        .maybeSingle();

      if (position) {
        await supabase
          .from('project_members')
          .insert({
            project_id: position.project_id,
            user_id: data.applicant_id,
            role: position.title,
          });
      }
    }

    return data as Application;
  },
};

// ============= PROJECT MEMBER SERVICES =============
export const projectMemberService = {
  async getMembersByProject(projectId: string): Promise<ProjectMember[]> {
    const { data, error } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Fetch users and project
    const userIds = [...new Set(data.map(m => m.user_id))];
    const [usersResult, projectResult] = await Promise.all([
      supabase.from('profiles').select('*').in('id', userIds),
      supabase.from('projects').select('*').eq('id', projectId).maybeSingle()
    ]);

    return data.map(m => ({
      ...m,
      user: usersResult.data?.find(u => u.id === m.user_id),
      project: projectResult.data,
    })) as ProjectMember[];
  },

  async getMembersByUser(userId: string): Promise<ProjectMember[]> {
    const { data, error } = await supabase
      .from('project_members')
      .select('*')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Fetch projects
    const projectIds = [...new Set(data.map(m => m.project_id))];
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds);

    return data.map(m => ({
      ...m,
      project: projects?.find(p => p.id === m.project_id),
    })) as ProjectMember[];
  },
};

// ============= REVIEW SERVICES =============
export const reviewService = {
  async getReviewsForUser(userId: string): Promise<Review[]> {
    return userService.getReviewsForUser(userId);
  },

  async createReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Create failed');

    return data as Review;
  },
};

// ============= MRR SERVICES =============
export const mrrService = {
  async getMRRByProject(projectId: string): Promise<MRRData[]> {
    const { data, error } = await supabase
      .from('mrr_data')
      .select('*')
      .eq('project_id', projectId)
      .order('month', { ascending: true });

    if (error) throw error;
    return (data || []) as MRRData[];
  },

  async getMRRByUser(
    userId: string
  ): Promise<{ projectId: string; projectTitle: string; data: MRRData[] }[]> {
    // Get user's projects
    const { data: members } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', userId);

    if (!members || members.length === 0) return [];

    const projectIds = [...new Set(members.map(m => m.project_id))];

    // Fetch projects and MRR data
    const [projectsResult, mrrResult] = await Promise.all([
      supabase.from('projects').select('*').in('id', projectIds),
      supabase.from('mrr_data').select('*').in('project_id', projectIds)
    ]);

    const projects = projectsResult.data || [];
    const allMRR = mrrResult.data || [];

    return projectIds.map(projectId => {
      const project = projects.find(p => p.id === projectId);
      const data = allMRR
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
    const { data, error } = await supabase
      .from('mrr_data')
      .insert(mrrData)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Insert failed');

    return data as MRRData;
  },
};

// ============= INVESTMENT ROUND SERVICES =============
export const investmentRoundService = {
  async getInvestmentRounds(projectId?: string): Promise<InvestmentRound[]> {
    let query = supabase
      .from('investment_rounds')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Fetch projects
    const projectIds = [...new Set(data.map(r => r.project_id))];
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds);

    return data.map(r => ({
      ...r,
      project: projects?.find(p => p.id === r.project_id),
    })) as InvestmentRound[];
  },

  async getInvestmentRoundById(id: string): Promise<InvestmentRound | null> {
    const { data, error } = await supabase
      .from('investment_rounds')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching investment round:', error);
      return null;
    }

    if (!data) return null;

    // Fetch project
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', data.project_id)
      .maybeSingle();

    return {
      ...data,
      project,
    } as InvestmentRound;
  },

  async createInvestmentRound(
    round: Omit<InvestmentRound, 'id' | 'created_at'>
  ): Promise<InvestmentRound> {
    const { data, error } = await supabase
      .from('investment_rounds')
      .insert(round)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Create failed');

    return data as InvestmentRound;
  },

  async updateInvestmentRound(
    id: string, 
    updates: Partial<InvestmentRound>
  ): Promise<InvestmentRound> {
    const { data, error } = await supabase
      .from('investment_rounds')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Update failed');

    return data as InvestmentRound;
  },

  async getOpenRounds(filters?: {
    category?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<InvestmentRound[]> {
    let query = supabase
      .from('investment_rounds')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (filters?.minAmount) {
      query = query.gte('amount_seeking', filters.minAmount);
    }

    if (filters?.maxAmount) {
      query = query.lte('amount_seeking', filters.maxAmount);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Fetch projects
    const projectIds = [...new Set(data.map(r => r.project_id))];
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds);

    let rounds = data.map(r => ({
      ...r,
      project: projects?.find(p => p.id === r.project_id),
    })) as InvestmentRound[];

    // Filter by category if needed
    if (filters?.category) {
      rounds = rounds.filter(r => r.project?.category === filters.category);
    }

    return rounds;
  },
};

// ============= INVESTMENT SERVICES =============
export const investmentService = {
  async getInvestments(roundId?: string, investorId?: string): Promise<Investment[]> {
    let query = supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false });

    if (roundId) {
      query = query.eq('round_id', roundId);
    }

    if (investorId) {
      query = query.eq('investor_id', investorId);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Fetch rounds and investors
    const roundIds = [...new Set(data.map(i => i.round_id))];
    const investorIds = [...new Set(data.map(i => i.investor_id))];

    const [roundsResult, investorsResult] = await Promise.all([
      supabase.from('investment_rounds').select('*').in('id', roundIds),
      supabase.from('profiles').select('*').in('id', investorIds)
    ]);

    return data.map(i => ({
      ...i,
      round: roundsResult.data?.find(r => r.id === i.round_id),
      investor: investorsResult.data?.find(u => u.id === i.investor_id),
    })) as Investment[];
  },

  async createInvestment(
    investment: Omit<Investment, 'id' | 'date'>
  ): Promise<Investment> {
    const { data, error } = await supabase
      .from('investments')
      .insert(investment)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Create failed');

    return data as Investment;
  },

  async updateInvestmentStatus(
    id: string, 
    status: 'pending' | 'confirmed'
  ): Promise<Investment> {
    const { data, error } = await supabase
      .from('investments')
      .update({ status })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Update failed');

    return data as Investment;
  },

  async getInvestorPortfolio(investorId: string): Promise<{
    investments: Investment[];
    totalInvested: number;
    portfolioCount: number;
  }> {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('investor_id', investorId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const investments = data || [];

    // Fetch rounds and investors
    if (investments.length > 0) {
      const roundIds = [...new Set(investments.map(i => i.round_id))];
      const [roundsResult, investorsResult] = await Promise.all([
        supabase.from('investment_rounds').select('*').in('id', roundIds),
        supabase.from('profiles').select('*').eq('id', investorId).maybeSingle()
      ]);

      const investmentsWithData = investments.map(i => ({
        ...i,
        round: roundsResult.data?.find(r => r.id === i.round_id),
        investor: investorsResult.data,
      })) as Investment[];

      const totalInvested = investments.reduce((sum, i) => sum + i.amount_invested, 0);
      const uniqueProjects = new Set(
        roundsResult.data?.map(r => r.project_id) || []
      );

      return {
        investments: investmentsWithData,
        totalInvested,
        portfolioCount: uniqueProjects.size,
      };
    }

    return {
      investments: [],
      totalInvested: 0,
      portfolioCount: 0,
    };
  },
};

// ============= INVESTOR REVIEW SERVICES =============
export const investorReviewService = {
  async getInvestorReviews(investorId: string): Promise<InvestorReview[]> {
    const { data, error } = await supabase
      .from('investor_reviews')
      .select('*')
      .eq('investor_id', investorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Fetch reviewers, investors, and projects
    const reviewerIds = [...new Set(data.map(r => r.reviewer_id))];
    const projectIds = [...new Set(data.map(r => r.project_id))];

    const [reviewersResult, investorResult, projectsResult] = await Promise.all([
      supabase.from('profiles').select('*').in('id', reviewerIds),
      supabase.from('profiles').select('*').eq('id', investorId).maybeSingle(),
      supabase.from('projects').select('*').in('id', projectIds)
    ]);

    return data.map(r => ({
      ...r,
      reviewer: reviewersResult.data?.find(u => u.id === r.reviewer_id),
      investor: investorResult.data,
      project: projectsResult.data?.find(p => p.id === r.project_id),
    })) as InvestorReview[];
  },

  async createInvestorReview(
    review: Omit<InvestorReview, 'id' | 'created_at'>
  ): Promise<InvestorReview> {
    const { data, error } = await supabase
      .from('investor_reviews')
      .insert(review)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Create failed');

    return data as InvestorReview;
  },

  async getAverageInvestorRating(investorId: string): Promise<number> {
    const { data, error } = await supabase
      .from('investor_reviews')
      .select('rating')
      .eq('investor_id', investorId);

    if (error) throw error;
    if (!data || data.length === 0) return 0;

    const sum = data.reduce((acc, r) => acc + r.rating, 0);
    return sum / data.length;
  },
};
