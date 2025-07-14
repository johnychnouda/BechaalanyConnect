export type BannerSwiperType = {
    full_path: {
        image: string;
    };
    title: string;
    subtitle: string;
    description: string | null;
};

export type HomepageSettingsType = {
    whatsapp_number: number;
    whatsapp_text: string;
    categories_section_title: string;
    view_all_button_label: string;
    featured_products_section_title: string;
    latest_products_section_title: string;
    whatsapp_channel_button_text: string;
    featured_products: ProductType[];
};

export type CategoryType = {
    id: number;
    slug: string;
    title: string;
    full_path: {
        image: string;
    };
};

export type ProductType = {
    id: number;
    slug: string;
    name: string;
    full_path: {
        image: string;
    };
    subcategory: {
        slug: string;
        title: string;
        category: {
            slug: string;
            title: string;
        }
    }
};

export type HomepageDataType = {
    bannerSwiper: BannerSwiperType[];
    homepageSettings: HomepageSettingsType;
    categories: CategoryType[];
    latest_products: ProductType[];
};