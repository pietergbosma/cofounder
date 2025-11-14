import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we have real Supabase credentials
const hasRealCredentials = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseAnonKey.includes('placeholder') &&
  !supabaseAnonKey.includes('your-anon-key')

// Mock users for development
const mockUsers = [
  {
    id: 'demo-founder-1',
    email: 'demo@founder.com',
    name: 'Demo Founder',
    bio: 'Demo founder account for testing the platform',
    skills: ['React', 'TypeScript', 'Node.js'],
    experience: '5 years of full-stack development',
    contact: 'demo@example.com',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo-founder',
    user_type: 'founder',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-investor-1', 
    email: 'demo@investor.com',
    name: 'Demo Investor',
    bio: 'Demo investor account for testing investment features',
    skills: ['Investment', 'Finance', 'Due Diligence'],
    experience: '10 years of venture capital experience',
    contact: 'investor@example.com',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo-investor',
    user_type: 'investor',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const supabase = hasRealCredentials ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
  }
}) : null

// Export flag to check if we're using real Supabase
export const isRealSupabase = hasRealCredentials

// Helper function to get current user
const getCurrentUser = async () => {
  if (!supabase) {
    // Return mock user or null
    const storedUser = localStorage.getItem('mockUser')
    return storedUser ? JSON.parse(storedUser) : null
  }
  
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  // Fetch profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()
    
  return profile || null
}

// Helper function to get session
const getSession = async () => {
  if (!supabase) {
    const storedUser = localStorage.getItem('mockUser')
    return storedUser ? { user: JSON.parse(storedUser) } : null
  }
  
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  return session
}

// Export functions
export { getCurrentUser, getSession, mockUsers }