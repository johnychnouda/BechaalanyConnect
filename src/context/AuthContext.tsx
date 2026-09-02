"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { signOut, signIn } from "next-auth/react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clearSessionCache } from '@/utils/api';
import { useAppSession } from '@/hooks/use-session';
import { useLanguage } from '@/hooks/use-language';
import { useCreditsStore } from '@/store/credits.store';
import { creditsService } from '@/services/credits.service';
import { fetchCurrentUser } from '@/services/api.service';

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
  user_types: UserSalesType | null;
  /** The price tier itself. Read this rather than user_types?.id: it is a plain column
   *  on the profile payload and is also carried in the session, so it survives even if
   *  the user_types relation stops being eager-loaded again. */
  user_types_id: number | null;
  verification_status: 'unsubmitted' | 'pending' | 'approved' | 'rejected';
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
  isApproved: boolean;
  /** Whether the live credits balance from /user/profile is trustworthy yet.
   *  'unknown' until the query has resolved at least once; 'error' if it's
   *  currently failing. Never gate an affordability check on the balance
   *  itself while this isn't 'known' — the store's balance starts at 0. */
  balanceStatus: 'unknown' | 'known' | 'error';
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
  const { setBalance } = useCreditsStore();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Stable authentication state that doesn't flicker during updates.
  const stableIsAuthenticated = useMemo(() => {
    if (sessionUser) return true;
    if (session?.laravelToken && status === "authenticated") return true;
    return sessionAuthenticated;
  }, [sessionUser, session?.laravelToken, status, sessionAuthenticated]);

  // Single live source for all volatile/large user data (financials, business info,
  // user_types, orders) — kept OUT of the session cookie. React Query dedupes calls,
  // caches across components, and refetches on an interval / window focus.
  const {
    data: profile,
    isFetching: isRefreshing,
    isSuccess: profileLoadedOnce,
    isError: profileErrored,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['user-profile', locale],
    queryFn: () => fetchCurrentUser(locale),
    enabled: !!session?.laravelToken,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Mirror the fresh balance into the credits store (the single real-time source the
  // header/indicator read) and propagate a changed verification_status back into the
  // cookie so the middleware unlocks the dashboard after a mid-session KYC approval.
  useEffect(() => {
    if (!profile) return;
    // credits_balance is a MySQL DECIMAL column with no ->decimal()/->float() cast on
    // the backend model, so Eloquent (via PDO) serialises it as a JSON string
    // ("39.24"), not a number, even though every type in this file claims `number`.
    // Fed straight into the credits store, that string reached BlurredPrice's
    // price.toFixed(2) and threw for every signed-in user with a balance, which
    // crash-looped the header component that wraps every page. Coerced once here,
    // at the single point the balance enters app state.
    const freshBalance = Number(profile.credits_balance ?? profile.user?.credits_balance ?? 0) || 0;
    setBalance(freshBalance);
    creditsService.syncBalanceFromSession(freshBalance);

    const freshStatus = profile.user?.verification_status;
    if (freshStatus && freshStatus !== sessionUser?.verification_status) {
      update({ verification_status: freshStatus });
    }
  }, [profile, sessionUser?.verification_status, setBalance, update]);

  // Keep the same signature callers rely on (e.g. after placing an order / adding credits).
  // A forced refresh invalidates the cache so every consumer of the shared query updates;
  // otherwise a plain refetch is enough.
  const refreshUserData = useCallback(async (forceRefresh: boolean = false) => {
    if (!session?.laravelToken) return;
    if (forceRefresh) {
      await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    } else {
      await refetchProfile();
    }
  }, [session?.laravelToken, refetchProfile, queryClient]);

  const user = useMemo(() => {
    if (!sessionUser && !profile) return null;
    const pu = profile?.user;
    return {
      id: sessionUser?.id ?? pu?.id?.toString() ?? '',
      name: sessionUser?.name || pu?.name || pu?.username || '',
      email: sessionUser?.email || pu?.email || '',
      role: sessionUser?.role || pu?.role || 'user',
      country: pu?.country || '',
      phone_number: pu?.phone_number || '',
      is_business_user: pu?.is_business_user || false,
      business_name: pu?.business_name || '',
      business_location: pu?.business_location || '',
      // Profile first, session second. /user/profile refetches every 5 minutes, so an
      // admin moving someone onto a price tier takes effect without a re-login; the
      // session copy is set at sign-in and only covers the gap before the first fetch.
      user_types: pu?.user_types ?? null,
      user_types_id: pu?.user_types_id ?? sessionUser?.user_types_id ?? null,
      // Same DECIMAL-as-string coercion as the balance effect above — these three
      // are typed `number` in UserType but the raw API values are strings.
      credits_balance: Number(profile?.credits_balance ?? pu?.credits_balance ?? 0) || 0,
      total_purchases: Number(profile?.total_purchases ?? pu?.total_purchases ?? 0) || 0,
      received_amount: Number(profile?.received_amount ?? pu?.received_amount ?? 0) || 0,
      orders: profile?.orders || [],
      verification_status: (pu?.verification_status || sessionUser?.verification_status || 'unsubmitted'),
    };
  }, [sessionUser, profile]);

  const token = sessionToken;
  const isAdmin = user?.role === 'admin';
  const isApproved = user?.verification_status === 'approved';
  const balanceStatus: 'unknown' | 'known' | 'error' =
    profileLoadedOnce ? 'known' : profileErrored ? 'error' : 'unknown';

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
      queryClient.removeQueries({ queryKey: ['user-profile'] });
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
      isApproved,
      balanceStatus,
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