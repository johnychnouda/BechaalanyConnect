"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { signOut, signIn } from "next-auth/react";
import { clearSessionCache } from '@/utils/api';
import { useAppSession } from '@/hooks/use-session';
import { useLanguage } from '@/hooks/use-language';
import { useCreditsStore } from '@/store/credits.store';
import { creditsService } from '@/services/credits.service';

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
  code?: string;
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
  login: (email: string, password: string, lang?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUserData: (forceRefresh?: boolean) => Promise<void>;
  isRefreshing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, status, update, isAuthenticated: sessionAuthenticated, user: sessionUser, token: sessionToken } = useAppSession();
  const { locale } = useLanguage();
  const { setBalance, initializeFromUser } = useCreditsStore();
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cachedUserData, setCachedUserData] = useState<any>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);

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

  // Clear cache when session changes to ensure data consistency
  useEffect(() => {
    // Only clear cache if we're completely logged out and not in the middle of a refresh
    if (!sessionUser && !session?.laravelToken && !isRefreshing) {
      setCachedUserData(null);
    }
    // Don't clear cache during refresh operations
  }, [sessionUser, session?.laravelToken, isRefreshing]);

  // Refresh user data function - now with better rate limiting and cache invalidation
  const refreshUserData = useCallback(async (forceRefresh: boolean = false) => {
    if (!session?.laravelToken) {
      return;
    }
    
    // Prevent multiple simultaneous refresh calls
    if (isRefreshing) {
      return;
    }

    // Time-based rate limiting: only refresh if 30 seconds have passed since last refresh
    // unless it's a forced refresh (e.g., after updating user info)
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;
    const MIN_REFRESH_INTERVAL = 30 * 1000; // 30 seconds

    if (!forceRefresh && timeSinceLastRefresh < MIN_REFRESH_INTERVAL) {
      return;
    }

    // Clear cached data for refresh
    setCachedUserData(null);
    
    setIsRefreshing(true);
    setLastRefreshTime(now); // Set refresh time at start to prevent multiple calls
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${locale}/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.laravelToken}`,
          'Content-Type': 'application/json',
          // Add cache-busting header for force refresh
          ...(forceRefresh && { 'Cache-Control': 'no-cache, no-store, must-revalidate' }),
        },
      });

      if (response.ok) {
        const freshUserData = await response.json();
        
        // Update credits store with fresh balance
        setBalance(freshUserData.credits_balance || 0);
        
        // Update session with fresh financial data (primarily for header display)
        await update({
          credits_balance: freshUserData.credits_balance,
          total_purchases: freshUserData.total_purchases,
          received_amount: freshUserData.received_amount,
        });
        
        // Clear cache after successful update
        setCachedUserData(null);
      } else {
        if (response.status === 429) {
        }
        throw new Error(`Failed to refresh user data: ${response.status}`);
      }
    } catch (error) {
      // Clear cache on error to fall back to session data
      setCachedUserData(null);
    } finally {
      setIsRefreshing(false);
    }
  }, [session?.laravelToken, update, sessionUser, session?.laravelUser, isRefreshing, locale, lastRefreshTime]);

  // Initialize credits store and auto-refresh when user is authenticated
  useEffect(() => {
    if (!stableIsAuthenticated || !session?.laravelToken) return;

    // Initialize credits store with current user balance
    if (sessionUser?.credits_balance !== undefined) {
      initializeFromUser(sessionUser.credits_balance);
    }

    // Refresh immediately when becoming authenticated
    refreshUserData(false);

    // Set up periodic refresh (every 5 minutes)
    const interval = setInterval(() => {
      refreshUserData(false);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [stableIsAuthenticated, session?.laravelToken, refreshUserData, sessionUser?.credits_balance, initializeFromUser]);

  // Sync credits store when user balance changes
  useEffect(() => {
    if (sessionUser?.credits_balance !== undefined) {
      creditsService.syncBalanceFromSession(sessionUser.credits_balance);
    }
  }, [sessionUser?.credits_balance]);

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

  const login = async (email: string, password: string, lang?: string) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: email,
        password,
        lang: lang || 'en',
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
      await signIn("google", { callbackUrl: locale === "ar" ? "/ar" : "/" });
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Call Laravel logout endpoint first if we have a token
      if (session?.laravelToken) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${locale}/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.laravelToken}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          // Continue with NextAuth logout even if Laravel logout fails
          console.warn('Laravel logout failed:', error);
        }
      }
      
      await signOut({ callbackUrl: locale === "ar" ? "/ar" : "/" });
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