import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'customer' | 'super_admin';
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  customerId: string | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string; verificationToken?: string }>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = '';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      const storedCustomerId = localStorage.getItem('auth_customer_id');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setCustomerId(storedCustomerId);

          // Verify token is still valid
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (!response.ok) {
            // Only clear auth state for actual auth failures (401/403)
            // Keep auth state for network errors or temporary server issues
            if (response.status === 401 || response.status === 403) {
              console.log('Token expired or invalid, clearing auth state');
              clearAuthState();
            } else {
              console.warn('Auth verification failed with status:', response.status, 'keeping existing auth state');
            }
          } else {
            const data = await response.json();
            setUser(data.user);
            setCustomerId(data.customerId);
            localStorage.setItem('auth_customer_id', data.customerId || '');
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          // Keep existing auth state on network errors - only clear on 401/403
          // clearAuthState(); // Removed - don't clear on network failures
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const clearAuthState = () => {
    setUser(null);
    setCustomerId(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_customer_id');
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      // Store auth data
      setUser(data.user);
      setCustomerId(data.customerId);
      setToken(data.token);
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      localStorage.setItem('auth_customer_id', data.customerId || '');

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string; verificationToken?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Signup failed' };
      }

      // Don't automatically log in - user needs to verify email first
      return { 
        success: true, 
        verificationToken: data.verificationToken // Only in development
      };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const verifyEmail = async (token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Email verification failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    clearAuthState();
    setLocation('/login');
  };

  const value: AuthContextType = {
    user,
    customerId,
    token,
    login,
    signup,
    logout,
    verifyEmail,
    isLoading,
    isAuthenticated: !!user && !!token,
    isSuperAdmin: user?.role === 'super_admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};