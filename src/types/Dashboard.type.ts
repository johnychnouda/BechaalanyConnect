export type DashboardSettingsType = {
    dashboard_menu_items: DashboardMenuItem[]
};

export type DashboardMenuItem = {
    title: string;
    slug: string;
    full_path: {
        icon: string;
    }
}