"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession, signOut, signIn } from "next-auth/react";

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
  // user_types_id: number;
  credits_balance: number;
  total_purchases: number;
  received_amount: number;
  orders?: Order[];
  user_types: UserSalesType; // Changed from UserSalesType[] to UserSalesType (single object)
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
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Listen for session updates
  useEffect(() => {
    const handleSessionUpdate = (event: CustomEvent) => {
      const { freshUserData } = event.detail;
      if (freshUserData) {
        setUserData(freshUserData);
      }
    };

    window.addEventListener('sessionUpdated', handleSessionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('sessionUpdated', handleSessionUpdate as EventListener);
    };
  }, []);

  // Derive authentication state from NextAuth session only
  const isAuthenticated = status === "authenticated" && !!session;

  // Refresh user data function
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
        setUserData(freshUserData);
        
        // Dispatch event for other components that might be listening
        window.dispatchEvent(new CustomEvent('sessionUpdated', { 
          detail: { freshUserData } 
        }));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [session?.laravelToken]);

  // Remove the automatic refresh useEffect to prevent infinite loops
  // Components can call refreshUserData manually when needed

  const user = session?.user ? {
    id: session.user.id,
    name: session.user.name || '',
    email: session.user.email || '',
    role: session.user.role || 'user',
    country: session.user.country || '',
    phone_number: session.user.phone_number || '',
    is_business_user: session.user.is_business_user || false,
    business_name: session.user.business_name || '',
    business_location: session.user.business_location || '',
    // user_types_id: session.user.user_types_id || 0,
    user_types: session.laravelUser?.user_types || [],
    credits_balance: userData?.credits_balance || session.user.credits_balance || 0,
    total_purchases: userData?.total_purchases || session.user.total_purchases || 0,
    received_amount: userData?.received_amount || session.user.received_amount || 0,
    orders: session.laravelUser?.orders || [],
  } : null;
  const token = session?.laravelToken || null;
  const isAdmin = user?.role === 'admin';

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Using NextAuth credentials provider for login
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