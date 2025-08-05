import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/ui/dashboard-layout";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import TransactionFilter from "@/components/general/TransactionFilter";
import { useAuth } from '@/context/AuthContext';
import { useGlobalContext } from "@/context/GlobalContext";
import { formatDate } from "@/utils/date";
import { motion, AnimatePresence } from 'framer-motion';
import { useAppTheme } from "@/hooks/use-app-theme";
import BackButton from "@/components/ui/back-button";
import { useUserData } from "@/hooks/useUserData";

const transactions = [
  { direction: 'up', title: "Pubg Mobile | 600 UC", date: "2025-03-14 18:37:07", status: 'Purchased' },
  { direction: 'down', title: "Payment", date: "2025-03-14 18:37:07", status: 'Received' },
  // ... more transactions ...
];

const statusMeta = {
  accepted: { color: "#5FD568", label: "Accepted", icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#5FD568"/><path d="M7 13.5L11 17L17 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ) },
  rejected: { color: "#E73828", label: "Rejected", icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#E73828"/><path d="M8 8L16 16M16 8L8 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ) },
  pending: { color: "#FB923C", label: "Pending", icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#FB923C"/><path d="M12 7V12L15 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ) },
};

export default function AccountDashboard() {
  const { user } = useUserData(true, 30000); // Auto-refresh every 30 seconds
  const { startOrderStatusPolling, stopOrderStatusPolling } = useGlobalContext();
  const { theme } = useAppTheme();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Start polling for order status changes when component mounts
  useEffect(() => {
    if (user) {
      startOrderStatusPolling(user.id);
    }

    // Clean up polling when component unmounts
    return () => {
      stopOrderStatusPolling();
    };
  }, [user, startOrderStatusPolling, stopOrderStatusPolling]);

  const handleDateChange = (from: string, to: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') {
      return transactions;
    }
    return transactions.filter(tx => tx.status.toLowerCase() === activeFilter.toLowerCase());
  }, [activeFilter]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-14">
        <div className="w-fit mb-2">
          <BackButton href="/" label="Home Page" />
        </div>
        {/* Content */}
        {activeSection === "dashboard" &&
          <>
            {/* Page Title & User Info */}
            <div className="flex flex-col items-start gap-1">
              <div className="flex flex-row items-center gap-2 flex-wrap">
                <span className="uppercase font-roboto font-semibold text-2xl md:text-[36px] leading-tight text-[#E73828] tracking-tight">
                  {user?.name || 'CHARBEL BECHAALANY'}
                </span>
                {/* VIP badge */}
                <span className="flex flex-row justify-center items-center border border-[#E73828] rounded-[20px] px-2 py-1 gap-1">
                  <span className="font-nunito font-medium text-[12px] leading-[16px] text-black dark:text-white">
                    VIP  0
                  </span>
                  <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.02494 2.01245C2.95107 2.01249 2.87857 2.03237 2.815 2.07C2.75144 2.10764 2.69915 2.16165 2.66359 2.2264L1.15109 4.9764C1.11123 5.04894 1.09411 5.13178 1.10196 5.21418C1.1098 5.29657 1.14225 5.3747 1.19509 5.4384L5.18259 10.2509C5.2213 10.2976 5.26983 10.3352 5.32473 10.361C5.37963 10.3868 5.43955 10.4002 5.50021 10.4002C5.56088 10.4002 5.6208 10.3868 5.6757 10.361C5.7306 10.3352 5.77913 10.2976 5.81784 10.2509L9.80534 5.4384C9.85818 5.3747 9.89063 5.29657 9.89847 5.21418C9.90632 5.13178 9.8892 5.04894 9.84934 4.9764L8.33684 2.2264C8.30124 2.16157 8.24886 2.1075 8.18519 2.06986C8.12152 2.03222 8.0489 2.01239 7.97494 2.01245H3.02494ZM2.28574 4.62495L3.26859 2.83745H4.09359L3.46769 4.62495H2.28574ZM3.37914 5.44995L4.44009 8.06135L2.27584 5.44995H3.37914ZM5.49389 8.4645L4.26959 5.44995H6.68189L5.49389 8.4645ZM4.34219 4.62495L4.96754 2.83745H6.03729L6.69564 4.62495H4.34219ZM7.57509 4.62495L6.91674 2.83745H7.73074L8.71414 4.62495H7.57509ZM7.56849 5.44995H8.72349L6.52074 8.10865L7.56849 5.44995Z" fill="#E73828"/>
                  </svg>
                </span>
              </div>
              <span className="font-nunito font-medium text-base md:text-[16px] leading-[22px] text-[#070707] dark:text-white">
                Wholesale Account
              </span>
            </div>

            {/* Summary Cards */}
            <div className="flex flex-col lg:flex-row gap-4 w-full">
              {/* Your Balance */}
              <div className="flex flex-col justify-center items-start p-4 md:p-[21px_16px] gap-[10px] w-full h-[104px] bg-[rgba(7,7,7,0.1)] dark:bg-[rgba(255,255,255,0.1)] rounded-[10px] overflow-hidden">
                <div className="flex flex-col items-start p-0 gap-2 w-full">
                  <span className="font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707] dark:text-white">
                    Your Balance
                  </span>
                  <span className="font-['Roboto'] font-semibold text-xl md:text-2xl leading-[28px] text-[#5FD568]">
                    {user?.credits_balance} $
                  </span>
                </div>
              </div>

              {/* Total Purchases */}
              <div className="flex flex-col justify-center items-start p-4 md:p-[21px_16px] gap-[10px] w-full h-[104px] bg-[rgba(7,7,7,0.1)] dark:bg-[rgba(255,255,255,0.1)] rounded-[10px] overflow-hidden">
                <div className="flex flex-col items-start p-0 gap-2 w-full">
                  <span className="font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707] dark:text-white">
                    Total Purchases
                  </span>
                  <span className="font-['Roboto'] font-semibold text-xl md:text-2xl leading-[28px] text-[#E73828]">
                    {user?.total_purchases} $
                  </span>
                </div>
              </div>

              {/* Received */}
              <div className="flex flex-col justify-center items-start p-4 md:p-[21px_16px] gap-[10px] w-full h-[104px] bg-[rgba(7,7,7,0.1)] dark:bg-[rgba(255,255,255,0.1)] rounded-[10px] overflow-hidden">
                <div className="flex flex-col items-start p-0 gap-2 w-full">
                  <span className="font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707] dark:text-white">
                    Received
                  </span>
                  <span className="font-['Roboto'] font-semibold text-xl md:text-2xl leading-[28px] text-[#5FD568]">
                    {user?.received_amount} $
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Filter */}
            <TransactionFilter 
              onDateChange={handleDateChange}
              onFilterChange={handleFilterChange}
            />

            {/* Transaction List */}
            <div className="flex flex-col items-start p-0 gap-2 max-w-full w-full">
              {isLoading ? (
                <div className="w-full flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E73828]"></div>
                </div>
              ) : (
                filteredTransactions.map((tx, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-row justify-between items-center p-3 gap-2 w-full max-w-full h-[66px] bg-[rgba(7,7,7,0.05)] dark:bg-[rgba(255,255,255,0.05)] rounded-[20px] md:rounded-[50.5px] overflow-x-auto"
                  >
                    {/* Left Section - Icon, Title, Date */}
                    <div className="flex flex-row items-center p-0 gap-4 min-w-0 flex-1">
                      {/* Icon Circle */}
                      <div className="relative w-9 h-9 flex-shrink-0">
                        <div className={`absolute w-9 h-9 rounded-full ${tx.direction === 'up' ? 'bg-[#E73828]' : 'bg-[#5FD568]'}`}></div>
                        <svg 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          className={`absolute left-[6px] top-[6px] ${tx.direction === 'down' ? 'transform rotate-180' : ''}`}
                        >
                          <path 
                            d="M12 5V19M12 5L5 12M12 5L19 12" 
                            stroke="white" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      {/* Title and Date */}
                      <div className="flex flex-col justify-center items-start p-0 gap-1 min-w-0">
                        <div className="flex flex-row items-center p-0 gap-1 w-full">
                          <span className="font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] dark:text-white truncate">
                            {tx.title.split(' | ')[0]}
                          </span>
                          {tx.title.includes(' | ') && (
                            <>
                              <span className="w-[1px] h-3 bg-[#E73828] flex-shrink-0"></span>
                              <span className="font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] dark:text-white truncate">
                                {tx.title.split(' | ')[1]}
                              </span>
                            </>
                          )}
                        </div>
                        <span className="font-['Roboto'] font-normal text-xs leading-[14px] text-[#8E8E8E] dark:text-[#a0a0a0]">
                          {formatDate(tx.date)}
                        </span>
                      </div>
                    </div>
                    {/* Right Section - Prices */}
                    <div className="flex flex-row justify-end items-center gap-2 flex-shrink-0">
                      <span className="font-['Roboto'] font-normal text-base leading-[19px] line-through text-[#E73828] text-right">
                        10 $
                      </span>
                      <span className="font-['Roboto'] font-normal text-base leading-[19px] text-[#5FD568] text-right">
                        50 $
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        }
      </div>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 50 }} />
    </DashboardLayout>
  );
}