"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { signOut, signIn } from "next-auth/react";
import { clearSessionCache } from '@/utils/api';
import { useAppSession } from '@/hooks/use-session';

export interface Order {
  id: number;
  cms_draft_flag: number;
  users_id: number;
  product_variation_id: number;
  quantity: number;
  total_price: string;
  recipient_user: string | null;
  recipient_phone_number: string | null;
  statuses_id: number;
  created_at: string;
  updated_at: string;
  product_variation: {
    id: number;
    name: string;
    price: string;
    image: string;
    product: Product;
  };
  users: {
    username: string;
    email: string;
    phone_number: string;
    country?: string;
    business_location?: string;
    business_name?: string;
  }
}

export interface Product {
  id: number;
  name: string;
  description: string;
  slug: string;
  full_path: {
    image: string;
  }
}

interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  country: string;
  phone_number: string;
  is_business_user: boolean;
  business_name: string;
  business_location: string;
  credits_balance: number;
  total_purchases: number;
  received_amount: number;
  orders?: Order[];
  user_types: UserSalesType;
}

interface UserSalesType {
  id: number;
  title: string;
  slug: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserType | null;
  token: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isSigninModalOpen: boolean;
  isCreateAccountModalOpen: boolean;
  setIsSigninModalOpen: (isOpen: boolean) => void;
  setIsCreateAccountModalOpen: (isOpen: boolean) => void;
  refreshUserData: () => Promise<void>;
  isRefreshing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, status, update, isAuthenticated: sessionAuthenticated, user: sessionUser, token: sessionToken } = useAppSession();
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const [cachedUserData, setCachedUserData] = useState<any>(null);

  // Use the centralized authentication state
  const isAuthenticated = sessionAuthenticated;

  // Create a stable authentication state that doesn't flicker during updates
  const stableIsAuthenticated = useMemo(() => {
    // If we have cached user data, we're definitely authenticated
    if (cachedUserData) return true;
    // If we have a session user, we're authenticated
    if (sessionUser) return true;
    // If we have a session token but no user yet, we're likely authenticated
    if (session?.laravelToken && status === "authenticated") return true;
    // Otherwise, use the session authentication status
    return sessionAuthenticated;
  }, [cachedUserData, sessionUser, session?.laravelToken, status, sessionAuthenticated]);

  // Debug logging for authentication state changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth state:', {
        stableIsAuthenticated,
        sessionAuthenticated,
        hasCachedData: !!cachedUserData,
        hasSessionUser: !!sessionUser,
        hasToken: !!session?.laravelToken,
        status,
        isRefreshing
      });
    }
  }, [stableIsAuthenticated, sessionAuthenticated, cachedUserData, sessionUser, session?.laravelToken, status, isRefreshing]);

  // Clear cache when session changes to ensure data consistency
  useEffect(() => {
    // Only clear cache if we're completely logged out and not in the middle of a refresh
    if (!sessionUser && !session?.laravelToken && !isRefreshing) {
      setCachedUserData(null);
    }
    // Don't clear cache during refresh operations
  }, [sessionUser, session?.laravelToken, isRefreshing]);

  // Refresh user data function - use NextAuth's built-in update
  const refreshUserData = useCallback(async () => {
    if (!session?.laravelToken) return;
    
    // Cache current user data to prevent flickering
    if (sessionUser) {
      setCachedUserData({
        id: sessionUser.id,
        name: sessionUser.name || '',
        email: sessionUser.email || '',
        role: sessionUser.role || 'user',
        country: sessionUser.country || '',
        phone_number: sessionUser.phone_number || '',
        is_business_user: sessionUser.is_business_user || false,
        business_name: sessionUser.business_name || '',
        business_location: sessionUser.business_location || '',
        user_types: session?.laravelUser?.user_types || [],
        credits_balance: sessionUser.credits_balance || 0,
        total_purchases: sessionUser.total_purchases || 0,
        received_amount: sessionUser.received_amount || 0,
        orders: session?.laravelUser?.orders || [],
      });
    } else if (session?.laravelToken && status === "authenticated") {
      // If we don't have sessionUser but have a token and are authenticated,
      // create a minimal cache to maintain authentication state
      setCachedUserData({
        id: 0, // Placeholder ID
        name: '',
        email: '',
        role: 'user',
        country: '',
        phone_number: '',
        is_business_user: false,
        business_name: '',
        business_location: '',
        user_types: [],
        credits_balance: 0,
        total_purchases: 0,
        received_amount: 0,
        orders: [],
      });
    }
    
    setIsRefreshing(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.laravelToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const freshUserData = await response.json();
        
        // Optimistic update: Update session immediately to prevent flickering
        await update({
          credits_balance: freshUserData.credits_balance,
          total_purchases: freshUserData.total_purchases,
          received_amount: freshUserData.received_amount,
        });
        
        // Clear cache after successful update
        setCachedUserData(null);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Clear cache on error to fall back to session data
      setCachedUserData(null);
    } finally {
      setIsRefreshing(false);
    }
  }, [session?.laravelToken, update, sessionUser, session?.laravelUser, status]);

  const user = cachedUserData || (sessionUser ? {
    id: sessionUser.id,
    name: sessionUser.name || '',
    email: sessionUser.email || '',
    role: sessionUser.role || 'user',
    country: sessionUser.country || '',
    phone_number: sessionUser.phone_number || '',
    is_business_user: sessionUser.is_business_user || false,
    business_name: sessionUser.business_name || '',
    business_location: sessionUser.business_location || '',
    user_types: session?.laravelUser?.user_types || [],
    credits_balance: sessionUser.credits_balance || 0,
    total_purchases: sessionUser.total_purchases || 0,
    received_amount: sessionUser.received_amount || 0,
    orders: session?.laravelUser?.orders || [],
  } : null);
  
  const token = sessionToken;
  const isAdmin = user?.role === 'admin';

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut({ callbackUrl: "/" });
      clearSessionCache();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: stableIsAuthenticated, 
      user, 
      token, 
      isAdmin, 
      login, 
      loginWithGoogle, 
      logout, 
      loading,
      isSigninModalOpen,
      isCreateAccountModalOpen,
      setIsSigninModalOpen,
      setIsCreateAccountModalOpen,
      refreshUserData,
      isRefreshing,
    }}>
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