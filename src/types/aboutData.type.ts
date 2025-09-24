export type AboutUsDataType = {
    about_page_setting: AboutPageSetting;
    contact_details: ContactDetails[];
    seo?: {
        title?: string | null;
        description?: string | null;
        keywords?: string | null;
        canonical_url?: string | null;
        meta_robots?: string | null;
        og?: {
            title?: string | null;
            description?: string | null;
            image?: string | null;
            url?: string | null;
            type?: string | null;
        } | null;
    } | null;
}

type AboutPageSetting = {
    title: string;
    description: string;
    contact_section_title: string;
    social_section_title: string;
    full_path: {
        image: string;
    }

}

type ContactDetails = {
    phone_number: string;
    email: string;
    location_url?: string | null;
    branch_name?: string | null;
    address?: string | null;
}