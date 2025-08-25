"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from "next/router";
import { fetchGeneralData, fetchDashboardSettings } from "@/services/api.service";
import { GeneralDataType } from "@/types/globalData.type";
import { DashboardSettingsType } from "@/types/Dashboard.type";
import { useAppSession } from '@/hooks/use-session';
import { useLanguage } from '@/hooks/use-language';

interface GlobalContextType {
  generalData: GeneralDataType | null;
  setGeneralData: (data: GeneralDataType | null) => void;
  dashboardSettings: DashboardSettingsType | null;
  setDashboardSettings: (data: DashboardSettingsType | null) => void;
  refreshOrders: () => void;
  setRefreshOrdersCallback: (callback: () => void) => void;
  refreshCredits: () => void;
  setRefreshCreditsCallback: (callback: () => void) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [generalData, setGeneralData] = useState<GeneralDataType | null>(null);
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettingsType | null>(null);
  const [refreshOrdersCallback, setRefreshOrdersCallback] = useState<(() => void) | null>(null);
  const [refreshCreditsCallback, setRefreshCreditsCallback] = useState<(() => void) | null>(null);
  const router = useRouter();
  const { session, update } = useAppSession();
  const { locale } = useLanguage();

  useEffect(() => {
    if (!router.locale) return;
    const locale = router.locale || 'en';

    // Fetch general data
    fetchGeneralData(locale).then(setGeneralData);
    
    // Fetch dashboard settings
    fetchDashboardSettings(locale)
      .then((data) => {
        if (data) {
          setDashboardSettings(data);
        }
      })
      .catch((error) => {
        console.error('Error fetching dashboard settings:', error);
        setDashboardSettings(null);
      });
  }, [router.locale]);

  const refreshOrders = useCallback(() => {
    if (refreshOrdersCallback) {
      refreshOrdersCallback();
    }
  }, [refreshOrdersCallback]);

  const setRefreshOrdersCallbackHandler = useCallback((callback: () => void) => {
    setRefreshOrdersCallback(() => callback);
  }, []);

  const refreshCredits = useCallback(() => {
    if (refreshCreditsCallback) {
      refreshCreditsCallback();
    }
  }, [refreshCreditsCallback]);

  const setRefreshCreditsCallbackHandler = useCallback((callback: () => void) => {
    setRefreshCreditsCallback(() => callback);
  }, []);



  // Clear session cache when session changes to ensure consistency
  useEffect(() => {
    if (session) {
      // Import and call clearSessionCache when session changes
      import('@/utils/api').then(({ clearSessionCache }) => {
        clearSessionCache();
      });
    }
  }, [session]);

  return (
    <GlobalContext.Provider value={{ 
      generalData, 
      setGeneralData,
      dashboardSettings,
      setDashboardSettings,
      refreshOrders,
      setRefreshOrdersCallback: setRefreshOrdersCallbackHandler,
      refreshCredits,
      setRefreshCreditsCallback: setRefreshCreditsCallbackHandler,
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
