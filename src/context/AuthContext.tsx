import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  profile_picture?: string;
  club_name?: string;
}

interface ClubSettings {
  id: number;
  user_id: number;
  primary_color: string;
  secondary_color: string;
  logo_filename?: string;
  logo_upload_date?: string;
}

interface AuthContextType {
  user: User | null;
  clubSettings: ClubSettings | null;
  sessionId: string | null;
  login: (credential: string) => Promise<void>;
  emailSignUp: (email: string, password: string, name: string) => Promise<void>;
  emailSignIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateClubSettings: (settings: Partial<ClubSettings>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [clubSettings, setClubSettings] = useState<ClubSettings | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      fetchProfile(storedSessionId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (session: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${session}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setClubSettings(data.clubSettings);
      } else {
        // Invalid session
        localStorage.removeItem('sessionId');
        setSessionId(null);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      localStorage.removeItem('sessionId');
      setSessionId(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credential: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setClubSettings(data.clubSettings);
        setSessionId(data.sessionId);
        localStorage.setItem('sessionId', data.sessionId);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const emailSignUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/email/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setClubSettings(data.clubSettings);
        setSessionId(data.sessionId);
        localStorage.setItem('sessionId', data.sessionId);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sign up failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const emailSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/email/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setClubSettings(data.clubSettings);
        setSessionId(data.sessionId);
        localStorage.setItem('sessionId', data.sessionId);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sign in failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (sessionId) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionId}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setClubSettings(null);
      setSessionId(null);
      localStorage.removeItem('sessionId');
    }
  };

  const updateClubSettings = (settings: Partial<ClubSettings>) => {
    setClubSettings(prev => prev ? { ...prev, ...settings } : null);
  };

  const value: AuthContextType = {
    user,
    clubSettings,
    sessionId,
    login,
    emailSignUp,
    emailSignIn,
    logout,
    updateClubSettings,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};