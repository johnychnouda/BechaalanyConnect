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
  amount: string;
  quantity: string;
  total: string;
  related_products: string;
  user_id_label: string;
  phone_number_label: string;
  buy_now_button: string;
  user_id_placeholder: string;
  phone_number_placeholder: string;
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

export type UserType = {
  id: number;
  title: string;
  slug: string;
  discount_percentage: number;
};

export type CountryType = {
  id: number;
  title: string;
  slug: string;
  code: string;
};

export type LoggingPageSettingsType = {
  sign_in_title: string;
  sign_in_subtitle: string;
  login_button: string;
  google_button: string;
  sign_up_title: string;
  sign_up_subtitle: string;
  sign_up_button: string;
  username_placeholder: string;
  email_placeholder: string;
  country_placeholder: string;
  phone_number_placeholder: string;
  password_placeholder: string;
  confirm_password_placeholder: string;
  forget_password_label: string;
  register_business_user_label: string;
  user_type_placeholder: string;
  store_name_placeholder: string;
  store_location_placeholder: string;
  forgot_password_title: string;
  forgot_password_subtitle: string;
  send_reset_link_button: string;
  reset_password_title: string;
  reset_password_subtitle: string;
  reset_password_button: string;
};


export type GeneralDataType = {
  settings: SettingsType;
  menu_items: MenuItemType[];
  social_links: SocialLinkType[];
  locale: LocaleType;
  user_types: UserType[];
  countries: CountryType[];
  user_current_balance: number;
  logging_page_settings: LoggingPageSettingsType;
};

export type GlobalContextType = {
  generalData: GeneralDataType | null;
  setGeneralData: React.Dispatch<React.SetStateAction<GeneralDataType | null>>;
};