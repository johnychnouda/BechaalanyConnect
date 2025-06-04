import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from '@/context/AuthContext';

export default function AccountSidebar() {
  const router = useRouter();
  const currentPath = usePathname();
  const { logout } = useAuth();

  const links = [
    { href: "/account-dashboard", label: "Dashboard" },
    { href: "/account-dashboard/add-credits", label: "Add Credits" },
    { href: "/account-dashboard/my-payments", label: "My Payments" },
    { href: "/account-dashboard/my-orders", label: "My Orders" },
    { href: "/account-dashboard/account-settings", label: "Account Settings" },
  ];

  return (
    <div className="flex flex-col items-start w-full h-full p-0">
      {/* Title */}
      <span className="font-['Roboto'] font-semibold text-[24px] leading-[28px] text-[#E73828] mb-6 ml-6 mt-6">My Account</span>
      {/* Links Container */}
      <div className="flex flex-col items-start gap-0 w-full px-6">
        {links.map((link, index) => (
          <React.Fragment key={link.href}>
            <div className="flex flex-col items-start w-full">
              <div className="flex flex-row items-center gap-[9px] w-full h-[32px]">
                <Link
                  href={link.href}
                  className={`font-['Roboto'] text-[16px] leading-[19px] px-0 py-0 ${
                    currentPath === link.href
                      ? 'font-semibold text-[#E73828]'
                      : 'font-semibold text-[#070707] hover:text-[#E73828]'
                  }`}
                >
                  {link.label}
                </Link>
              </div>
            </div>
            {/* Divider - Don't show after last item and not after Logout */}
            {index < links.length - 1 && (
              <div className="w-full h-[1px] bg-[#070707] opacity-20 my-2" />
            )}
          </React.Fragment>
        ))}
        {/* Logout Section */}
        <div className="mt-8 pt-6 border-t border-[#070707] w-full">
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="group flex items-center gap-2 font-['Roboto'] font-semibold text-[16px] bg-[#E73828] text-white border border-[#E73828] rounded-full px-6 py-2 transition-all duration-200 hover:bg-white hover:text-[#E73828] hover:border-[#E73828] shadow-sm w-full"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="transform group-hover:translate-x-1 transition-transform duration-200 stroke-white group-hover:stroke-[#E73828]"
            >
              <path 
                d="M17 16L21 12M21 12L17 8M21 12H9M9 21H7C5.93913 21 4.92172 20.5786 4.17157 19.8284C3.42143 19.0783 3 18.0609 3 17V7C3 5.93913 3.42143 4.92172 4.17157 4.17157C4.92172 3.42143 5.93913 3 7 3H9" 
                stroke="currentColor"
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
} 