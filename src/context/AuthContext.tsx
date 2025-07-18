"use client";

import React, { createContext, useContext, useState } from 'react';
import { useSession, signOut, signIn } from "next-auth/react";

interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  // Using a more specific type instead of any
  [key: string]: string | number | boolean | undefined;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);


  // Derive authentication state from NextAuth session only
  const isAuthenticated = status === "authenticated" && !!session;
  const user = session?.user ? {
    id: session.user.id,
    name: session.user.name || '',
    email: session.user.email || '',
    role: session.user.role || 'user',
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