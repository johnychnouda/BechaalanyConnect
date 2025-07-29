"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from "next/router";
import { fetchGeneralData } from "@/services/api.service";
import { GeneralDataType } from "@/types/globalData.type";
import { getSession, signIn } from 'next-auth/react';

interface GlobalContextType {
  generalData: GeneralDataType | null;
  setGeneralData: (data: GeneralDataType | null) => void;
  refreshOrders: () => void;
  setRefreshOrdersCallback: (callback: () => void) => void;
  refreshUserSession: () => Promise<void>;
  startOrderStatusPolling: (userId?: string) => void;
  stopOrderStatusPolling: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [generalData, setGeneralData] = useState<GeneralDataType | null>(null);
  const [refreshOrdersCallback, setRefreshOrdersCallback] = useState<(() => void) | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!router.locale) return;
    fetchGeneralData(router.locale).then(setGeneralData);
  }, [router.locale]);

  const refreshOrders = useCallback(() => {
    if (refreshOrdersCallback) {
      refreshOrdersCallback();
    }
  }, [refreshOrdersCallback]);

  const setRefreshOrdersCallbackHandler = useCallback((callback: () => void) => {
    setRefreshOrdersCallback(() => callback);
  }, []);

  const refreshUserSession = useCallback(async () => {
    try {
      // Get current session
      const session = await getSession();
      if (!session) {
        console.error('No session found');
        return;
      }

      // Fetch fresh user data from the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.laravelToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const freshUserData = await response.json();
        console.log('Fresh user data fetched:', freshUserData);
        
        // Update the session data directly
        if (session.laravelUser && freshUserData) {
          session.laravelUser = {
            ...session.laravelUser,
            ...freshUserData,
          };
          
          session.user = {
            ...session.user,
            credits_balance: freshUserData.credits_balance || session.user.credits_balance,
          };
        }
        
        // Force a re-render by dispatching a custom event
        window.dispatchEvent(new CustomEvent('sessionUpdated', { 
          detail: { freshUserData } 
        }));
      } else {
        console.error('Failed to fetch fresh user data');
      }
    } catch (error) {
      console.error('Error refreshing user session:', error);
    }
  }, []);

  const startOrderStatusPolling = useCallback((userId?: string) => {
    // Only start polling if user is authenticated
    if (!userId) return;

    console.log('Starting order status polling for user:', userId);

    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll every 30 seconds to check for order status changes
    const interval = setInterval(async () => {
      try {
        console.log('Polling for order status changes...');
        
        // Refresh orders to check for status changes
        if (refreshOrdersCallback) {
          refreshOrdersCallback();
        }
        
        // Refresh user session to get updated credits balance
        await refreshUserSession();
      } catch (error) {
        console.error('Error during order status polling:', error);
      }
    }, 30000); // 30 seconds

    pollingIntervalRef.current = interval;
  }, [refreshOrdersCallback, refreshUserSession]);

  const stopOrderStatusPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return (
    <GlobalContext.Provider value={{ 
      generalData, 
      setGeneralData,
      refreshOrders,
      setRefreshOrdersCallback: setRefreshOrdersCallbackHandler,
      refreshUserSession,
      startOrderStatusPolling,
      stopOrderStatusPolling,
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};
