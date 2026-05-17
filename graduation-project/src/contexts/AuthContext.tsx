import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginUser as loginApiCall, refreshToken as refreshApiCall } from '../services/auth';
import type { LoginResponse } from '../types/auth';

interface User {
  email: string;
  displayName: string;
  token: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  authenticate: (userData: User) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshAccessToken: () => Promise<boolean>;
  handleApiError: (error: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

const readAccessToken = (data: any): string =>
  data?.token || data?.accessToken || data?.access_token || data?.AccessToken || '';

const readRefreshToken = (data: any): string =>
  data?.refreshToken || data?.refresh || data?.refresh_token || data?.RefreshToken || '';


export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user data on mount
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        
        // Validate that user data has required fields
        if (userData && userData.token && userData.email) {
          setUser(userData);
          setIsAuthenticated(true);
          
          // Only attempt to refresh token if it exists and is expired (older than 24 hours)
          const tokenTimestamp = localStorage.getItem('tokenTimestamp');
          const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
          
          // Only refresh if timestamp exists and is older than 24 hours
          if (tokenTimestamp && parseInt(tokenTimestamp) < twentyFourHoursAgo) {
            if (userData.refreshToken) {
              refreshAccessToken().catch(error => {
                console.error('Failed to refresh token on app load:', error);
                // Don't log out automatically on app load - let the user continue with existing token
              });
            }
          } else if (!tokenTimestamp) {
            // Set initial timestamp if it doesn't exist
            localStorage.setItem('tokenTimestamp', Date.now().toString());
          }
        } else {
          // Invalid user data, clear it
          localStorage.removeItem('user');
          localStorage.removeItem('tokenTimestamp');
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('tokenTimestamp');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: LoginResponse = await loginApiCall({ email, password });
      
      if (response.succeeded && response.data) {
        const accessToken = readAccessToken(response.data);
        const refreshToken = readRefreshToken(response.data);
        const userData: User = {
          email: response.data.email || email,
          displayName: response.data.displayName || 'User',
          token: accessToken,
          refreshToken: refreshToken
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('tokenTimestamp', Date.now().toString());
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    localStorage.removeItem('user');
    localStorage.removeItem('tokenTimestamp');
  };

  const authenticate = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('tokenTimestamp', Date.now().toString());
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      if (!user || !user.refreshToken) {
        console.log('Cannot refresh token: missing user or refresh token');
        return false;
      }

      console.log('Attempting token refresh for user:', user.email);
      const response = await refreshApiCall({
        accessToken: user.token,
        refreshToken: user.refreshToken
      });

      console.log('Token refresh response:', response);

      if (response.succeeded && response.data) {
        const accessToken = readAccessToken(response.data);
        const refreshToken = readRefreshToken(response.data);
        const updatedUser: User = {
          email: response.data.email || user.email,
          displayName: response.data.displayName || user.displayName,
          token: accessToken || user.token,
          refreshToken: refreshToken || user.refreshToken
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('tokenTimestamp', Date.now().toString());
        console.log('Token refresh successful');
        return true;
      } else {
        console.log('Token refresh failed:', response.message);
        // Only log out if this is from an API call, not from app load
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // Don't automatically log out - let the user continue with existing token
      return false;
    }
  };

  // Global error handler for API calls
  const handleApiError = async (error: any) => {
    if (error.message?.includes('401') || error.message?.includes('Token expired')) {
      console.log('401 error detected, attempting automatic token refresh');
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        console.log('Token refresh failed, but keeping user logged in');
        // Don't automatically log out - let the user continue with existing token
      }
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    authenticate,
    isAuthenticated,
    isLoading,
    refreshAccessToken,
    handleApiError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
