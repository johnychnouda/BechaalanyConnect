"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from "next/router";
import { fetchGeneralData } from "@/services/api.service";
import { GeneralDataType } from "@/types/globalData.type";

interface GlobalContextType {
  generalData: GeneralDataType | null;
  setGeneralData: (data: GeneralDataType | null) => void;
  refreshOrders: () => void;
  setRefreshOrdersCallback: (callback: () => void) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [generalData, setGeneralData] = useState<GeneralDataType | null>(null);
  const [refreshOrdersCallback, setRefreshOrdersCallback] = useState<(() => void) | null>(null);
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

  return (
    <GlobalContext.Provider value={{ 
      generalData, 
      setGeneralData,
      refreshOrders,
      setRefreshOrdersCallback: setRefreshOrdersCallbackHandler,
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
