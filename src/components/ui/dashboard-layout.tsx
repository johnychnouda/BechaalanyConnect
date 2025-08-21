import React from "react";
import AccountSidebar from "@/components/ui/account-sidebar";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import { useGlobalContext } from "@/context/GlobalContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { dashboardSettings } = useGlobalContext();
  return (
    <div className="flex flex-col min-h-screen bg-[#F7F7F7] dark:bg-[#1a1a1a]">
      <div className="flex w-full max-w-[1400px] mx-auto bg-white dark:bg-[#2a2a2a] md:rounded-[32px] border border-[#E73828]/10 shadow-[0_4px_24px_0_rgba(0,0,0,0.04)] flex-col xl:flex-row mt-0 md:my-8">
        {/* Sidebar (hidden on mobile/tablet/laptop) */}
        <aside className="hidden xl:flex w-[240px] flex-shrink-0 border-r border-[#E73828]/10 p-4 justify-end bg-white dark:bg-[#2a2a2a] rounded-l-[32px]">
          <AccountSidebar menuItems={dashboardSettings?.dashboard_menu_items || null} />
        </aside>
        {/* Main Content */}
        <main className="flex-1 px-6 py-4 md:py-8 md:px-12 flex flex-col gap-6 md:gap-14">
          {/* Mobile/Tablet Nav */}
          <div className="xl:hidden">
            <AccountSidebar menuItems={dashboardSettings?.dashboard_menu_items || null} />
          </div>
          {children}
        </main>
      </div>
      {/* WhatsApp Floating Button */}
      {/* <WhatsAppButton style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 50 }} /> */}
    </div>
  );
} 