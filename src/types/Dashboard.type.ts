export type DashboardSettingsType = {
    dashboard_menu_items: DashboardMenuItem[]
    dashboard_page_settings: DashboardPageSettingsType;
};

export type DashboardPageSettingsType = {
    homepage_button_label: string;
    logout_button: string;
    balance_label: string;
    total_purchases_label: string;
    received_amount_label: string;
    from_label: string;
    to_label: string;
    search_button: string;
    all_transfers_label: string;
    received_filter_label: string;
    purchased_filter_label: string;
    my_orders_page_title: string;
    all_payments_label: string;
    accepted_label: string;
    rejected_label: string;
    pending_label: string;
    refresh_order_button: string;
    my_payments_page_title: string;
    add_credits_page_title: string;
    account_settings_page_title: string;
    account_info_label: string;
};

export type DashboardMenuItem = {
    title: string;
    slug: string;
    full_path: {
        icon: string;
    }
}