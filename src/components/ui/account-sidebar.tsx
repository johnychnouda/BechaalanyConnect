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
      <div className="flex flex-col items-start gap-0.5 w-full px-2">
        {links.map((link, index) => (
          <React.Fragment key={link.href}>
            <div className="flex flex-col items-start w-full">
              <Link
                href={link.href}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentPath === link.href
                    ? 'bg-[#E73828]/10 text-[#E73828]'
                    : 'text-[#070707] hover:bg-[#E73828]/5 hover:text-[#E73828]'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="font-['Roboto'] text-[13px] leading-[16px] font-semibold">
                  {link.label}
                </span>
              </Link>
            </div>
          </React.Fragment>
        ))}
        {/* Logout Section */}
        <div className="mt-4 pt-3 border-t border-[#070707]/20 w-full px-2">
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="group flex items-center justify-center gap-2 font-['Roboto'] font-semibold text-[13px] bg-[#E73828] text-white border border-[#E73828] rounded-lg px-3 py-2 transition-all duration-200 hover:bg-white hover:text-[#E73828] hover:border-[#E73828] shadow-sm w-full"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile/Tablet Version */}
      <div className="flex flex-col items-start w-full h-full p-0 xl:hidden">
        <SidebarContent />
      </div>
      {/* Desktop Version */}
      <div className="hidden xl:flex flex-col items-start w-full h-full p-0">
        <SidebarContent />
      </div>
    </>
  );
} 