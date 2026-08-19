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
  /** Site labels came from cache because the API was unreachable. */
  siteDataStale: boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [generalData, setGeneralData] = useState<GeneralDataType | null>(null);
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettingsType | null>(null);
  // True when the site labels on screen came from cache because the API was
  // unreachable — lets the UI say so rather than silently showing stale text.
  const [siteDataStale, setSiteDataStale] = useState(false);
  const [refreshOrdersCallback, setRefreshOrdersCallback] = useState<(() => void) | null>(null);
  const [refreshCreditsCallback, setRefreshCreditsCallback] = useState<(() => void) | null>(null);
  const router = useRouter();
  const { session, update } = useAppSession();
  const { locale } = useLanguage();

  /**
   * Cache the last successful payload per locale.
   *
   * `generalData` holds every CMS-managed label on the site — button text, field
   * labels, the footer. When the fetch failed it was set to null/undefined and the
   * entire UI rendered with blank captions, which looks far more broken than showing
   * slightly stale text. Falling back to the last good copy keeps the site usable
   * through a brief API outage.
   */
  const cacheKey = (name: string, loc: string) => `bc:${name}:${loc}`;

  const readCache = <T,>(name: string, loc: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.sessionStorage.getItem(cacheKey(name, loc));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  };

  const writeCache = (name: string, loc: string, value: unknown) => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(cacheKey(name, loc), JSON.stringify(value));
    } catch {
      // Quota or private mode — the cache is an optimisation, never a requirement.
    }
  };

  useEffect(() => {
    if (!router.locale) return;
    const activeLocale = router.locale || 'en';

    // These now reject instead of resolving undefined (api.service no longer swallows
    // failures), so both need explicit handling — an unhandled rejection here left
    // every CMS label blank.
    fetchGeneralData(activeLocale)
      .then((data) => {
        if (data) {
          setGeneralData(data);
          writeCache('general', activeLocale, data);
          setSiteDataStale(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching general data:', error);
        const cached = readCache<GeneralDataType>('general', activeLocale);
        if (cached) {
          setGeneralData(cached);
          setSiteDataStale(true);
        } else {
          setSiteDataStale(true);
        }
      });

    fetchDashboardSettings(activeLocale)
      .then((data) => {
        if (data) {
          setDashboardSettings(data);
          writeCache('dashboard', activeLocale, data);
        }
      })
      .catch((error) => {
        console.error('Error fetching dashboard settings:', error);
        setDashboardSettings(readCache<DashboardSettingsType>('dashboard', activeLocale));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      siteDataStale,
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
