import React, { useState } from "react";
import AccountSidebar from "@/components/ui/account-sidebar";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex flex-1 w-full xl:flex-row">
        {/* Sidebar (hidden on mobile/tablet/laptop) */}
        <aside className="hidden xl:flex w-[277px] flex-shrink-0 border-r border-[#E73828]/10 p-6 bg-white">
          <AccountSidebar />
        </aside>
        {/* Main Content */}
        <main className="flex-1 w-full px-2 sm:px-4 md:px-6 xl:px-8 py-4 md:py-6">
          {children}
        </main>
      </div>
      {/* WhatsApp Floating Button */}
      <WhatsAppButton style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 50 }} />
    </div>
  );
} 