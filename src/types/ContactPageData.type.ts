export type ContactUsDataType = {
    contact_page_setting: ContactPageSettingType
    contact_details: ContactDetailsType
    contact_form_subjects: ContactFormSubjectType[]
}

export type ContactPageSettingType = {
    title: string
    description: string
    name_label: string
    email_label: string
    phone_label: string
    subject_label: string
    message_label: string
    button_text: string
    contact_title: string
    follow_us_title: string
    full_path: {
        image: string
    }
}

export type ContactDetailsType = {
    branch_name: string
    phone_number: string
    email: string
    address?: string | null
    location_url?: string | null
};

export type ContactFormSubjectType = {
    id: number
    slug: string
    title: string
}