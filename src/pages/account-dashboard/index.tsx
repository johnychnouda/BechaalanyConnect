import React, { useState, useMemo } from "react";
import AccountSidebar from "@/components/ui/account-sidebar";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import TransactionFilter from "@/components/general/TransactionFilter";
import { useAuth } from '@/context/AuthContext';

const transactions = [
  { direction: 'up', title: "Transfer to John | Bank Account", date: "2025-03-14 18:37:07", status: 'Transfer' },
  { direction: 'down', title: "Refund for Order #123 | PayPal", date: "2025-03-14 18:37:07", status: 'Refund' },
  { direction: 'up', title: "Pubg Mobile | 600 UC | Game Purchase", date: "2025-03-14 18:37:07", status: 'Purchased' },
  { direction: 'down', title: "Payment from Alice | Wallet", date: "2025-03-14 18:37:07", status: 'Received' },
  { direction: 'up', title: "Transfer to Bob | Credit Card", date: "2025-03-14 18:37:07", status: 'Transfer' },
  { direction: 'down', title: "Refund for Order #456 | Stripe", date: "2025-03-14 18:37:07", status: 'Refund' },
  // ... more transactions ...
];

const payments: Array<{
  id: number;
  status: 'accepted' | 'rejected' | 'pending';
  title: string;
  value: string;
  date: string;
  screenshot: string | null;
}> = [
  {
    id: 1,
    status: "accepted",
    title: "Whish 100$",
    value: "100$",
    date: "2025-03-14 18:37:07",
    screenshot: "/sample-payment-screenshot.png",
  },
  {
    id: 2,
    status: "rejected",
    title: "Whish 100$",
    value: "100$",
    date: "2025-03-14 18:37:07",
    screenshot: "/sample-payment-screenshot.png",
  },
  ...Array(5).fill(0).map((_, i) => ({
    id: 3 + i,
    status: "accepted" as const,
    title: "Whish 100$",
    value: "100$",
    date: "2025-03-14 18:37:07",
    screenshot: null,
  })),
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

function PaymentRow({ payment, expanded, onToggle }: { payment: typeof payments[number]; expanded: boolean; onToggle: () => void }) {
  const meta = statusMeta[payment.status];
  return (
    <div className="bg-[#F3F3F3] rounded-2xl mb-4">
      <div className="flex items-center px-6 py-3 cursor-pointer" onClick={onToggle}>
        <span className="mr-3">{meta.icon}</span>
        <span className="font-bold text-base text-[#070707]">{payment.title}</span>
        <span className="ml-2 text-xs text-[#8E8E8E]">{payment.date}</span>
        <span className="ml-auto">
          <svg className={`transition-transform ${expanded ? 'rotate-180' : ''}`} width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="#E73828" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </div>
      {expanded && (
        <div className="px-6 pb-4 pt-0 animate-fade-in">
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex items-center gap-8">
              <span className="text-base text-[#8E8E8E]">Total</span>
              <span className="text-base text-[#070707] font-bold ml-auto">{payment.value}</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-base text-[#8E8E8E]">Value</span>
              <span className="text-base text-[#070707] font-bold ml-auto">{payment.value}</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-base text-[#8E8E8E]">Date</span>
              <span className="text-base text-[#070707] font-bold ml-auto">{payment.date}</span>
            </div>
          </div>
          {payment.screenshot && (
            <div className="mt-4">
              <span className="block text-xs text-[#8E8E8E] mb-1">Screenshot:</span>
              <img src={payment.screenshot} alt="Payment Screenshot" className="rounded-lg border border-[#E0E0E0] max-w-xs max-h-64 object-contain" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AccountDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const handleDateChange = (from: string, to: string) => {
    // Handle date change
    console.log('Date range changed:', { from, to });
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
    <div className="flex justify-center items-start min-h-screen bg-[#F7F7F7] py-16">
      <div className="flex w-full max-w-[1400px] bg-white rounded-[32px] border border-[#E73828]/10 shadow-[0_4px_24px_0_rgba(0,0,0,0.04)]">
        {/* Sidebar */}
        <aside className="w-[300px] flex-shrink-0 border-r border-[#E73828]/10 p-8 flex justify-end bg-white rounded-l-[32px]">
          <AccountSidebar />
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-16 flex flex-col gap-14">
          {/* Content */}
          {activeSection === "dashboard" && (
            <>
              {/* Page Title & User Info */}
              <div className="flex flex-col items-start gap-1">
                <div className="flex flex-row items-center gap-2">
                  <span className="uppercase font-roboto font-semibold text-[36px] leading-[42px] text-[#E73828] tracking-tight">
                    {user?.name || 'CHARBEL BECHAALANY'}
                  </span>
                  {/* VIP badge */}
                  <span className="flex flex-row justify-center items-center border border-[#E73828] rounded-[20px] px-2 py-1 gap-1" style={{width:61, height:24, boxSizing:'border-box'}}>
                    <span className="font-nunito font-medium text-[12px] leading-[16px] text-black" style={{width:30, height:16, fontFamily:'Nunito'}}>
                      VIP {user?.vipLevel || 0}
                    </span>
                    <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:11, height:12}}>
                      <path d="M3.02494 2.01245C2.95107 2.01249 2.87857 2.03237 2.815 2.07C2.75144 2.10764 2.69915 2.16165 2.66359 2.2264L1.15109 4.9764C1.11123 5.04894 1.09411 5.13178 1.10196 5.21418C1.1098 5.29657 1.14225 5.3747 1.19509 5.4384L5.18259 10.2509C5.2213 10.2976 5.26983 10.3352 5.32473 10.361C5.37963 10.3868 5.43955 10.4002 5.50021 10.4002C5.56088 10.4002 5.6208 10.3868 5.6757 10.361C5.7306 10.3352 5.77913 10.2976 5.81784 10.2509L9.80534 5.4384C9.85818 5.3747 9.89063 5.29657 9.89847 5.21418C9.90632 5.13178 9.8892 5.04894 9.84934 4.9764L8.33684 2.2264C8.30124 2.16157 8.24886 2.1075 8.18519 2.06986C8.12152 2.03222 8.0489 2.01239 7.97494 2.01245H3.02494ZM2.28574 4.62495L3.26859 2.83745H4.09359L3.46769 4.62495H2.28574ZM3.37914 5.44995L4.44009 8.06135L2.27584 5.44995H3.37914ZM5.49389 8.4645L4.26959 5.44995H6.68189L5.49389 8.4645ZM4.34219 4.62495L4.96754 2.83745H6.03729L6.69564 4.62495H4.34219ZM7.57509 4.62495L6.91674 2.83745H7.73074L8.71414 4.62495H7.57509ZM7.56849 5.44995H8.72349L6.52074 8.10865L7.56849 5.44995Z" fill="#E73828"/>
                    </svg>
                  </span>
                </div>
                <span className="font-nunito font-medium text-[16px] leading-[22px] text-[#070707]">
                  Wholesale Account
                </span>
              </div>
              {/* Summary Cards */}
              <div className="flex flex-row items-center p-0 gap-6 w-[879px] h-[104px]">
                {/* Your Balance */}
                <div className="flex flex-col justify-center items-start p-[21px_16px] gap-[10px] w-[277px] h-[104px] bg-[rgba(7,7,7,0.1)] rounded-[10px]">
                  <div className="flex flex-col items-start p-0 gap-2 w-[129px] h-[55px]">
                    <span className="w-[129px] h-[19px] font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707]">
                      Your Balance
                    </span>
                    <span className="w-[129px] h-[28px] font-['Roboto'] font-semibold text-2xl leading-[28px] text-[#5FD568]">
                      50.00 $
                    </span>
                  </div>
                </div>
                {/* Total Purchases */}
                <div className="flex flex-col justify-center items-start p-[21px_16px] gap-[10px] w-[277px] h-[104px] bg-[rgba(7,7,7,0.1)] rounded-[10px]">
                  <div className="flex flex-col items-start p-0 gap-2 w-[129px] h-[55px]">
                    <span className="w-[129px] h-[19px] font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707]">
                      Total Purchases
                    </span>
                    <span className="w-[129px] h-[28px] font-['Roboto'] font-semibold text-2xl leading-[28px] text-[#E73828]">
                      320.00 $
                    </span>
                  </div>
                </div>
                {/* Received */}
                <div className="flex flex-col justify-center items-start p-[21px_16px] gap-[10px] w-[277px] h-[104px] bg-[rgba(7,7,7,0.1)] rounded-[10px]">
                  <div className="flex flex-col items-start p-0 gap-2 w-[129px] h-[55px]">
                    <span className="w-[129px] h-[19px] font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707]">
                      Received
                    </span>
                    <span className="w-[129px] h-[28px] font-['Roboto'] font-semibold text-2xl leading-[28px] text-[#5FD568]">
                      370.00 $
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
              <div className="flex flex-col items-start p-0 gap-3 w-[879px]">
                {filteredTransactions.map((tx, i) => (
                  <div key={i} className="flex flex-row justify-between items-center p-[12px_16px] gap-[10px] w-[879px] h-[61px] bg-[rgba(7,7,7,0.05)] rounded-[50.5px]">
                    {/* Left Section - Icon, Title, Date */}
                    <div className="flex flex-row items-center p-0 gap-4 w-[285.56px] h-[37px]">
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
                      <div className="flex flex-col justify-center items-start p-0 gap-0 w-[220px] min-h-[37px]">
                        <span className="font-['Roboto'] font-semibold text-base leading-[19px]">
                          {tx.title.split(' | ').map((part, idx, arr) => (
                            <React.Fragment key={idx}>
                              <span className="text-[#070707]">{part}</span>
                              {idx < arr.length - 1 && <span className="text-[#E73828]"> | </span>}
                            </React.Fragment>
                          ))}
                        </span>
                        <span className="font-['Roboto'] font-normal text-xs leading-[14px] text-[#8E8E8E] mt-1">
                          {tx.date}
                        </span>
                      </div>
                    </div>
                    {/* Right Section - Prices */}
                    <div className="flex flex-row justify-end items-center gap-2 w-[90px]">
                      <span className="w-[31px] h-[19px] font-['Roboto'] font-normal text-base leading-[19px] line-through text-[#E73828] text-right">
                        10 $
                      </span>
                      <span className="w-[31px] h-[19px] font-['Roboto'] font-normal text-base leading-[19px] text-[#5FD568] text-right">
                        50 $
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {activeSection === "payments" && (
            <div className="max-w-4xl mx-auto py-8 px-2">
              <div className="text-[#E73828] text-3xl font-bold mb-4">ACCOUNT SETTINGS</div>
              <div className="flex gap-4 mb-6">
                <input type="date" className="border rounded-lg px-4 py-2" defaultValue="2024-11-10" />
                <input type="date" className="border rounded-lg px-4 py-2" defaultValue="2025-11-10" />
                <button className="ml-2 bg-[#E73828] text-white px-6 py-2 rounded-full font-bold">SEARCH</button>
              </div>
              <div className="flex gap-3 mb-6">
                <button className="bg-[#F3F3F3] px-4 py-1 rounded-full border border-[#E0E0E0] text-[#070707] font-semibold">All Payments</button>
                <button className="bg-[#5FD568] px-4 py-1 rounded-full text-white font-semibold">Accepted</button>
                <button className="bg-[#E73828] px-4 py-1 rounded-full text-white font-semibold">Rejected</button>
                <button className="bg-[#FB923C] px-4 py-1 rounded-full text-white font-semibold">Pending</button>
              </div>
              {payments.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  expanded={expandedId === payment.id}
                  onToggle={() => setExpandedId(expandedId === payment.id ? null : payment.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
      {/* WhatsApp Floating Button */}
      <WhatsAppButton style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 50 }} />
    </div>
  );
}