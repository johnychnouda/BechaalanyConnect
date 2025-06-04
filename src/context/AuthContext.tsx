"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { 
    name: string;
    vipLevel: number;
  } | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ name: string; vipLevel: number } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    setIsAuthenticated(!!token);
    if (token) {
      setUser({ 
        name: 'CHARBEL BECHAALANY',
        vipLevel: 2 // Mock VIP level
      });
    }
  }, []);

  const login = () => {
    localStorage.setItem('auth-token', 'mock-token');
    setIsAuthenticated(true);
    setUser({ 
      name: 'CHARBEL BECHAALANY',
      vipLevel: 2 // Mock VIP level
    });
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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