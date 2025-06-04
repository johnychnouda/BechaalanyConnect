export interface GlobalStateType {
    generalData?: {
        menu_items?: menuItem[] | [];
        settings: GeneralSettings;
        locale: LanguageType;
    };
}


  type LanguageType = {
    en?: { title?: string };
    ar?: { title?: string };
  };
export interface GeneralSettings {
    whatsapp_number: string;
    logo: string;
    dark_mode_logo: string;
    admin_email: string;
    create_account_button: string;
    footer_copyright: string;
}

export interface menuItem {
    id: string;
    url: string;
    icon: string;
    title: string
    full_path: {
        icon: string
    }
    slug: string
}