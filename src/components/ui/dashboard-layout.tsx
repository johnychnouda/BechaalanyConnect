import React from "react";
import AccountSidebar from "@/components/ui/account-sidebar";
import WhatsAppButton from "@/components/ui/whatsapp-button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen py-12 px-0 bg-white">
      {/* Sidebar */}
      <aside className="ml-[50px] mt-[60px] w-[277px] h-[411px] bg-white border border-[#E73828] rounded-[10px] flex-shrink-0 flex flex-col p-0 shadow-none">
        <AccountSidebar />
      </aside>
      {/* Main Content */}
      <main className="ml-[24px] mt-[60px] w-[879px] flex flex-col">
        {children}
      </main>
      {/* WhatsApp Floating Button */}
      <WhatsAppButton style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 50 }} />
    </div>
  );
} 