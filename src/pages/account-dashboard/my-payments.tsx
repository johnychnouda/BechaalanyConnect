import DashboardLayout from "@/components/ui/dashboard-layout";
import React, { useState } from "react";
import { formatDate } from "@/utils/date";

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
    screenshot: "/sample-payment-screenshot.png",
  })),
];

const statusMeta = {
  accepted: { color: "#5FD568", label: "Accepted", icon: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#5FD568"/><path d="M7 13.5L11 17L17 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ) },
  rejected: { color: "#E73828", label: "Rejected", icon: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#E73828"/><path d="M8 8L16 16M16 8L8 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ) },
  pending: { color: "#FB923C", label: "Pending", icon: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#FB923C"/><path d="M12 7V12L15 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ) },
};

function PaymentRow({ payment, expanded, onToggle }: { payment: typeof payments[number]; expanded: boolean; onToggle: () => void }) {
  const meta = statusMeta[payment.status];
  return (
    <div className="bg-[#F3F3F3] rounded-[20px] mb-4 w-full shadow-none">
      <div className="flex items-center px-6 py-4 cursor-pointer" onClick={onToggle}>
        <span className="mr-4">{meta.icon}</span>
        <span className="font-['Roboto'] font-normal text-[16px] text-[#070707]">{payment.title}</span>
        <span className="ml-auto text-xs text-[#8E8E8E]">{formatDate(payment.date)}</span>
        <span className="ml-4">
          <svg className={`transition-transform ${expanded ? 'rotate-180' : ''}`} width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="#E73828" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </div>
      {expanded && (
        <div className="px-6 pb-4 pt-0 animate-fade-in">
          <div className="flex flex-col gap-2 mb-2 text-right">
            <div className="flex flex-row justify-between items-center">
              <span className="text-[16px] text-[#070707] font-normal">Total</span>
              <span className="text-[16px] text-[#8E8E8E] font-normal">{payment.value}</span>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className="text-[16px] text-[#070707] font-normal">Value</span>
              <span className="text-[16px] text-[#8E8E8E] font-normal">{payment.value}</span>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className="text-[16px] text-[#070707] font-normal">Date</span>
              <span className="text-[16px] text-[#8E8E8E] font-normal">{formatDate(payment.date)}</span>
            </div>
          </div>
          {payment.screenshot && (
            <div className="mt-4 flex flex-col items-start">
              <span className="block text-[16px] text-[#070707] mb-1">Screenshot</span>
              <img src={payment.screenshot} alt="Payment Screenshot" className="rounded-lg border border-[#E0E0E0] w-[267px] h-[475px] object-contain" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyPayments() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filterButtons = [
    {
      key: "all",
      label: "All Payments",
      className: activeFilter === "all"
        ? "bg-[#F3F3F3] border border-[#E0E0E0] text-[#070707]"
        : "bg-white border border-[#E0E0E0] text-[#070707]",
      icon: null,
      width: "w-[160px]",
    },
    {
      key: "accepted",
      label: "Accepted",
      className: activeFilter === "accepted"
        ? "bg-[#5FD568] border border-[#5FD568] text-white"
        : "bg-white border border-[#5FD568] text-[#5FD568]",
      icon: (
        <span className="absolute left-[12px] flex items-center justify-center" style={{width:'19px',height:'19px',top:'50%',transform:'translateY(-50%)'}}>
          <span style={{background:'#5FD568',borderRadius:'50%',width:'19px',height:'19px',display:'block',position:'absolute',left:0,top:0}}></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" style={{position:'absolute',left:'3.17px',top:'3.17px'}}>
            <path d="M3.5 7.5L6 10L10 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ),
      width: "w-[140px]",
    },
    {
      key: "rejected",
      label: "Rejected",
      className: activeFilter === "rejected"
        ? "bg-[#E73828] border border-[#E73828] text-white"
        : "bg-white border border-[#E73828] text-[#E73828]",
      icon: (
        <span className="absolute left-[12px] flex items-center justify-center" style={{width:'19px',height:'19px',top:'50%',transform:'translateY(-50%)'}}>
          <span style={{background:'#E73828',borderRadius:'50%',width:'19px',height:'19px',display:'block',position:'absolute',left:0,top:0}}></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" style={{position:'absolute',left:'3.17px',top:'3.17px'}}>
            <rect x="3" y="5.5" width="7" height="1.67" rx="0.8" fill="white" transform="rotate(45 6.335 6.335)" />
            <rect x="3" y="5.5" width="7" height="1.67" rx="0.8" fill="white" transform="rotate(-45 6.335 6.335)" />
          </svg>
        </span>
      ),
      width: "w-[140px]",
    },
    {
      key: "pending",
      label: "Pending",
      className: activeFilter === "pending"
        ? "bg-[#FB923C] border border-[#FB923C] text-white"
        : "bg-white border border-[#FB923C] text-[#FB923C]",
      icon: (
        <span className="absolute left-[12px] flex items-center justify-center" style={{width:'19px',height:'19px',top:'50%',transform:'translateY(-50%)'}}>
          <span style={{background:'#FF9D00',borderRadius:'50%',width:'19px',height:'19px',display:'block',position:'absolute',left:0,top:0}}></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" style={{position:'absolute',left:'3.17px',top:'3.17px'}}>
            <rect x="5.5" y="3" width="1.67" height="5.5" rx="0.8" fill="white" />
            <rect x="5.5" y="9.2" width="1.67" height="1.67" rx="0.8" fill="white" />
          </svg>
        </span>
      ),
      width: "w-[140px]",
    },
  ];

  // Filter payments based on activeFilter
  const filteredPayments = activeFilter === "all"
    ? payments
    : payments.filter(p => p.status === activeFilter);

  return (
    <DashboardLayout>
      <div className="text-[#E73828] text-[36px] font-semibold font-['Roboto'] leading-[42px] uppercase mb-8 mt-0 tracking-tight">MY PAYMENTS</div>
      <div className="flex flex-col items-start w-full pb-6 gap-[25px] border-b border-[rgba(0,0,0,0.1)] mb-8" style={{ boxSizing: 'border-box' }}>
        <div className="flex flex-row gap-[25px] w-full h-[66px]">
          <div className="flex flex-col gap-1 w-[377px] h-full">
            <span className="text-[16px] font-semibold font-['Roboto'] text-[#070707] mb-1">From</span>
            <input type="date" className="border border-[#070707] rounded-[50.5px] px-[24px] py-[12px] w-full font-['Roboto'] text-[16px] font-normal h-[43px]" defaultValue="2024-11-10" />
          </div>
          <div className="flex flex-col gap-1 w-[377px] h-full">
            <span className="text-[16px] font-semibold font-['Roboto'] text-[#070707] mb-1">Till</span>
            <input type="date" className="border border-[#070707] rounded-[50.5px] px-[24px] py-[12px] w-full font-['Roboto'] text-[16px] font-normal h-[43px]" defaultValue="2025-11-10" />
          </div>
          <div className="flex flex-col gap-1 w-[74px] h-full">
            <span className="opacity-0 select-none text-[16px] font-semibold font-['Roboto'] mb-1">Search</span>
            <button className="bg-[#E73828] text-white rounded-[50.5px] font-bold text-[12px] uppercase flex items-center justify-center border border-[#E73828] transition-colors duration-200 hover:bg-white hover:text-[#E73828] hover:border-[#E73828] h-[43px]" style={{ width: '74px', padding: 0, letterSpacing: '0.5px' }}>SEARCH</button>
          </div>
        </div>
        <div className="flex flex-row items-start gap-4" style={{height:'35px'}}>
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              className={`flex flex-row items-center rounded-[50.5px] px-[12px] py-[8px] font-['Roboto'] font-semibold text-[16px] h-[35px] justify-center items-center relative ${btn.className} ${btn.width}`}
              onClick={() => setActiveFilter(btn.key)}
              type="button"
            >
              {btn.icon}
              <span className="w-full text-center">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full">
        {filteredPayments.map((payment) => (
          <PaymentRow
            key={payment.id}
            payment={payment}
            expanded={expandedId === payment.id}
            onToggle={() => setExpandedId(expandedId === payment.id ? null : payment.id)}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}
