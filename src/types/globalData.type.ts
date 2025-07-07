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
      about_icons: string;
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