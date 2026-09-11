import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  collegeNumber?: string;
  senescytNumber?: string;
  avatar?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  updateProfile: (updates: { name: string; role: string; collegeNumber?: string; avatar?: string; password?: string }) => Promise<void>;
  isDemoMode: boolean;
}

export const DEFAULT_DEMO_USER: UserProfile = {
  id: 'dr-reyes',
  email: 'dr.reyes@ukiana.clinic',
  name: 'Dr. Alejandro Reyes',
  role: 'Psicólogo Especialista Sanitario',
  collegeNumber: 'Senescyt N° 1005-2024-2849102',
  senescytNumber: 'Senescyt N° 1005-2024-2849102',
  avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250'
};

const extractUserProfile = (authUser: any): UserProfile => {
  const email = authUser.email || '';
  let name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || '';
  
  if (!name && email) {
    const part = email.split('@')[0];
    const formatted = part.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    name = `Dr/a. ${formatted}`;
  }
  if (!name) name = 'Dr/a. Facultativo Sanitario';

  const regNum = authUser.user_metadata?.college_number || authUser.user_metadata?.senescyt_number || 'Senescyt N° 1005-2024-2849102';

  return {
    id: authUser.id,
    email,
    name,
    role: authUser.user_metadata?.role || 'Psicólogo General Sanitario',
    collegeNumber: regNum,
    senescytNumber: regNum,
    avatar: authUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250'
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured) {
      // Check active Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(extractUserProfile(session.user));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(extractUserProfile(session.user));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Local fallback mode: check localStorage for saved session
      const savedUser = localStorage.getItem('ukiana_demo_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.setItem('ukiana_demo_user', JSON.stringify(DEFAULT_DEMO_USER));
          setUser(DEFAULT_DEMO_USER);
        }
      } else {
        localStorage.setItem('ukiana_demo_user', JSON.stringify(DEFAULT_DEMO_USER));
        setUser(DEFAULT_DEMO_USER);
      }
      setIsLoading(false);
    }
  }, []);


  const login = async (email: string, password?: string) => {
    if (isSupabaseConfigured) {
      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser(extractUserProfile(data.user));
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
      }
    } else {
      // Demo local authentication
      const profile: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        name: email.toLowerCase().includes('reyes') ? 'Dr. Alejandro Reyes' : `Dr/a. ${email.split('@')[0].toUpperCase()}`,
        role: 'Psicólogo General Sanitario',
        collegeNumber: 'Senescyt N° 1005-2024-2849102',
        senescytNumber: 'Senescyt N° 1005-2024-2849102',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250'
      };
      localStorage.setItem('ukiana_demo_user', JSON.stringify(profile));
      setUser(profile);
    }
  };

  const loginAsDemo = () => {
    localStorage.setItem('ukiana_demo_user', JSON.stringify(DEFAULT_DEMO_USER));
    setUser(DEFAULT_DEMO_USER);
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('ukiana_demo_user');
    setUser(null);
  };

  const updateProfile = async (updates: { name: string; role: string; collegeNumber?: string; avatar?: string; password?: string }) => {
    if (isSupabaseConfigured) {
      const updateData: any = {
        data: {
          full_name: updates.name,
          role: updates.role,
          college_number: updates.collegeNumber,
          senescyt_number: updates.collegeNumber,
          avatar_url: updates.avatar
        }
      };
      if (updates.password) {
        updateData.password = updates.password;
      }
      const { data, error } = await supabase.auth.updateUser(updateData);
      if (error) throw error;
      if (data.user) {
        setUser(extractUserProfile(data.user));
      }
    } else {
      if (user) {
        const updated: UserProfile = {
          ...user,
          name: updates.name,
          role: updates.role,
          collegeNumber: updates.collegeNumber || user.collegeNumber,
          senescytNumber: updates.collegeNumber || user.senescytNumber,
          avatar: updates.avatar || user.avatar
        };
        localStorage.setItem('ukiana_demo_user', JSON.stringify(updated));
        setUser(updated);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsDemo,
        logout,
        updateProfile,
        isDemoMode: !isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
