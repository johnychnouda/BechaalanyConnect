import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";
import { fetchGeneralData } from "@/services/api.service";

// Types based on your provided JSON
export type SettingsType = {
  whatsapp_number: string;
  full_path: {
    logo: string;
    dark_mode_logo: string;
  };
  admin_email: string;
  create_account_button: string;
  footer_copyright: string;
  login_button: string;
  categories_label: string;
  homepage_label: string;
  back_button_label: string;
};

export type MenuItemType = {
  slug: string;
  full_path: {
    icon: string;
  };
  title: string;
};

export type SocialLinkType = {
  full_path: {
    icon: string;
  };
  title: string;
  url: string;
};

export type LocaleType = {
  [key: string]: {
    slug: string;
    title: string;
    direction: string;
  };
};

export type GeneralDataType = {
  settings: SettingsType;
  menu_items: MenuItemType[];
  social_links: SocialLinkType[];
  locale: LocaleType;
};

export type GlobalContextType = {
  generalData: GeneralDataType | null;
  setGeneralData: React.Dispatch<React.SetStateAction<GeneralDataType | null>>;
};

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
