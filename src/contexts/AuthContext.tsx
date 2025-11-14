import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, AuthContextType } from '../types';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user on mount
    async function loadUser() {
      setLoading(true);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await fetchUserProfile(authUser.id);
        }
      } finally {
        setLoading(false);
      }
    }
    loadUser();

    // Set up auth listener - IMPORTANT: Keep simple, no async operations in callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }

    if (data) {
      setUser(data as User);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error) throw error;

    if (data.user) {
      await fetchUserProfile(data.user.id);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    userType: 'founder' | 'investor'
  ) => {
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

    // Profile will be created automatically by the database trigger
    if (data.user) {
      // Wait a moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchUserProfile(data.user.id);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
