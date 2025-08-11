"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Use the centralized authentication state
  const isAuthenticated = sessionAuthenticated;

  // Refresh user data function - use NextAuth's built-in update
  const refreshUserData = useCallback(async () => {
    if (!session?.laravelToken) return;
    
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
        
        // Use NextAuth's update method to refresh the session
        await update({
          credits_balance: freshUserData.credits_balance,
          total_purchases: freshUserData.total_purchases,
          received_amount: freshUserData.received_amount,
        });
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [session?.laravelToken, update]);

  const user = sessionUser ? {
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
  } : null;
  
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
      isAuthenticated, 
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