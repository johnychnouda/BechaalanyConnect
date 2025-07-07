import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";
import { fetchGeneralData } from "@/services/api.service";
import { GeneralDataType, GlobalContextType } from "@/types/globalData.type";


const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [generalData, setGeneralData] = useState<GeneralDataType | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!router.locale) return;
    fetchGeneralData(router.locale).then(setGeneralData);
  }, [router.locale]);

  return (
    <GlobalContext.Provider value={{ generalData, setGeneralData }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
