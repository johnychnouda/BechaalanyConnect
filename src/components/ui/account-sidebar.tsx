import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import {
  HomeIcon,
  CreditCardIcon,
  WalletIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function AccountSidebar({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const currentPath = usePathname();
  const { logout } = useAuth();

  const links = [
    { 
      href: "/account-dashboard", 
      label: "Dashboard",
      icon: HomeIcon
    },
    { 
      href: "/account-dashboard/add-credits", 
      label: "Add Credits",
      icon: CreditCardIcon
    },
    { 
      href: "/account-dashboard/my-payments", 
      label: "My Payments",
      icon: WalletIcon
    },
    { 
      href: "/account-dashboard/my-orders", 
      label: "My Orders",
      icon: ShoppingBagIcon
    },
    { 
      href: "/account-dashboard/account-settings", 
      label: "Account Settings",
      icon: Cog6ToothIcon
    },
  ];

  const SidebarContent = () => (
    <>
      {/* Title */}
      <div className="px-4 py-3">
        <span className="font-['Roboto'] font-semibold text-[16px] leading-[20px] text-[#E73828]">My Account</span>
      </div>
      {/* Links Container */}
      <div className="flex flex-row xl:flex-col items-center w-full px-2 gap-2 xl:gap-2 whitespace-nowrap overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-[#E73828]/30 xl:whitespace-normal xl:overflow-visible xl:max-w-none">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 ${
              currentPath === link.href
                ? 'bg-[#E73828]/10 text-[#E73828] dark:text-white'
                : 'text-[#070707] hover:bg-[#E73828]/5 hover:text-[#E73828] dark:text-white'
            }`}
          >
            <link.icon className="w-4 h-4 text-[#070707] dark:text-white" />
            <span className="font-['Roboto'] text-[13px] leading-[16px] font-semibold">
              {link.label}
            </span>
          </a>
        ))}
      </div>
      {/* Logout Section */}
      <div className="mt-4 pt-3 border-t border-[#070707]/20 w-full pb-8 mb-0 flex flex-col items-center">
        <button
          onClick={logout}
          className="group flex items-center justify-center gap-2 font-['Roboto'] font-semibold text-[13px] bg-[#E73828] text-white border border-[#E73828] rounded-lg px-4 py-2.5 transition-all duration-200 hover:bg-white hover:text-[#E73828] hover:border-[#E73828] shadow-sm"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4 text-white" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile/Tablet Version */}
      <div className="flex flex-col items-start w-full h-full p-0 xl:hidden dark:bg-[rgba(255,255,255,0.12)] dark:rounded-2xl">
        <SidebarContent />
      </div>
      {/* Desktop Version */}
      <div className="hidden xl:flex flex-col items-start w-full h-full p-0">
        <div className="w-full">
          <SidebarContent />
        </div>
      </div>
    </>
  );
} 