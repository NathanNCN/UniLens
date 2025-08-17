'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';


// Interface for the user object
export interface User {
  uuid: string;
  email: string;
  name: string;
}

// Interface for the auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  checkAuthStatus: () => Promise<boolean>;
}

// Create the auth context to store the user and auth status
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to access the auth context in components
export const useAuth = () => {
  const context = useContext(AuthContext);

  // Throw an error if the hook is used outside of an AuthProvider
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {

  // State to store the user and loading status
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to check for existing session on mount
  useEffect(() => {
    // Check for existing session on mount
    checkAuthStatus();
    
    // Check if user just redirected from login page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
     
      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
     
      // Force auth check after OAuth redirect
      setTimeout(() => {
        checkAuthStatus();
      }, 500);
    }
  }, []);

  // Function to check if the user is authenticated
  const checkAuthStatus = async (): Promise<boolean> => {
    try {

      // Call backend to check if the user is authenticated
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/auth/me`, {
        credentials: 'include', // Include cookies
      });
      
      // If the user is authenticated, set the user and return true
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return true;
      }

      // If the user is not authenticated, return false
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to login the user
  const login = () => {
    // Token is handled via HTTP-only cookies, so we just need to check auth status
    // Add a small delay so user can see the login feedback
    
    setTimeout(() => {
      checkAuthStatus();
    }, 1000); // 1 second delay
  };

  // Function to logout the user
  const logout = async () => {
    try {
      // Call backend to logout the user
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      // Add a small delay so user can see the logout feedback
      // Clear the user
      setTimeout(() => {
        setUser(null);
      }, 1000); // 1 second delay
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear user on error, but with delay
      setTimeout(() => {
        setUser(null);
      }, 1000);
    }
  };

  // Value to pass to the auth context
  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    checkAuthStatus,
  };

  // Return the auth context provider
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 