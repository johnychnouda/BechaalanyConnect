import DashboardLayout from "@/components/ui/dashboard-layout";
import React, { useState } from "react";
import { formatDate } from "@/utils/date";
import BackButton from "@/components/ui/back-button";

const orders: Array<{
  id: number;
  status: 'accepted' | 'rejected' | 'pending';
  title: string;
  value: string;
  date: string;
}> = [
  { id: 1, status: "accepted", title: "Pubg Mobile | 600 UC", value: "10$", date: "2025-03-14 18:37:07" },
  { id: 2, status: "rejected", title: "Pubg Mobile | 600 UC", value: "10$", date: "2025-03-14 18:37:07" },
  { id: 3, status: "accepted", title: "Pubg Mobile | 600 UC", value: "10$", date: "2025-03-14 18:37:07" },
  { id: 4, status: "accepted", title: "Pubg Mobile | 600 UC", value: "10$", date: "2025-03-14 18:37:07" },
  { id: 5, status: "rejected", title: "Pubg Mobile | 600 UC", value: "10$", date: "2025-03-14 18:37:07" },
  { id: 6, status: "accepted", title: "Pubg Mobile | 600 UC", value: "10$", date: "2025-03-14 18:37:07" },
  { id: 7, status: "pending", title: "Pubg Mobile | 600 UC", value: "10$", date: "2025-03-14 18:37:07" },
  { id: 8, status: "accepted", title: "Pubg Mobile | 600 UC", value: "10$", date: "2025-03-14 18:37:07" },
  { id: 9, status: "rejected", title: "Pubg Mobile | 600 UC", value: "10$", date: "2025-03-14 18:37:07" },
  { id: 10, status: "accepted", title: "Pubg Mobile | 600 UC", value: "10$", date: "2025-03-14 18:37:07" },
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

function OrderRow({ order }: { order: typeof orders[number] }) {
  const meta = statusMeta[order.status];
  return (
    <div className="flex flex-row justify-between items-center p-[12px_16px] gap-[10px] w-full h-[61px] bg-[rgba(7,7,7,0.05)] rounded-[50.5px] mb-2">
      {/* Left Section - Icon, Title, Date */}
      <div className="flex flex-row items-center p-0 gap-4 w-[285.56px] h-[37px]">
        {/* Icon Circle */}
        <div className="relative w-9 h-9">
          <div className={`absolute w-9 h-9 rounded-full`} style={{ background: meta.color }}></div>
          <span className="absolute left-[6px] top-[6px]">{meta.icon}</span>
        </div>
        {/* Title and Date */}
        <div className="flex flex-col justify-center items-start p-0 gap-1 w-[151px] h-[37px]">
          <div className="flex flex-row items-center p-0 gap-1 w-[151px] h-[19px]">
            <span className="w-[90px] h-[19px] font-['Roboto'] font-normal text-base leading-[19px] text-[#070707]">
              {order.title.split(' | ')[0]}
            </span>
            {order.title.includes(' | ') && (
              <>
                <span className="w-[1px] h-3 bg-[#E73828]"></span>
                <span className="w-[52px] h-[19px] font-['Roboto'] font-normal text-base leading-[19px] text-[#070707]">
                  {order.title.split(' | ')[1]}
                </span>
              </>
            )}
          </div>
          <span className="w-[150px] h-[14px] font-['Roboto'] font-normal text-xs leading-[14px] text-[#8E8E8E]">
            {formatDate(order.date)}
          </span>
        </div>
      </div>
      {/* Right Section - Price */}
      <div className="flex flex-row justify-end items-center gap-2 w-[90px]">
        <span className="w-[31px] h-[19px] font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] text-right">
          {order.value}
        </span>
      </div>
    </div>
  );
}

export default function MyOrders() {
  const [fromDate, setFromDate] = useState("2024-11-10");
  const [toDate, setToDate] = useState("2025-11-10");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filterButtons = [
    {
      key: "all",
      label: "All Orders",
      className:
        activeFilter === "all"
          ? "bg-[#F3F3F3] border border-[#E0E0E0] text-[#070707] w-[160px]"
          : "bg-white border border-[#E0E0E0] text-[#070707] w-[160px]",
      icon: null,
    },
    {
      key: "accepted",
      label: "Accepted",
      className:
        activeFilter === "accepted"
          ? "bg-[#5FD568] border border-[#5FD568] text-white w-[140px]"
          : "bg-white border border-[#5FD568] text-[#5FD568] w-[140px]",
      icon: (
        <span className="absolute left-[12px] flex items-center justify-center" style={{ width: 19, height: 19, top: '50%', transform: 'translateY(-50%)' }}>
          <span style={{ background: '#5FD568', borderRadius: '50%', width: 19, height: 19, display: 'block', position: 'absolute', left: 0, top: 0 }}></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" style={{ position: 'absolute', left: 3.17, top: 3.17 }}>
            <path d="M3.5 7.5L6 10L10 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ),
    },
    {
      key: "rejected",
      label: "Rejected",
      className:
        activeFilter === "rejected"
          ? "bg-[#E73828] border border-[#E73828] text-white w-[140px]"
          : "bg-white border border-[#E73828] text-[#E73828] w-[140px]",
      icon: (
        <span className="absolute left-[12px] flex items-center justify-center" style={{ width: 19, height: 19, top: '50%', transform: 'translateY(-50%)' }}>
          <span style={{ background: '#E73828', borderRadius: '50%', width: 19, height: 19, display: 'block', position: 'absolute', left: 0, top: 0 }}></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" style={{ position: 'absolute', left: 3.17, top: 3.17 }}>
            <rect x="3" y="5.5" width="7" height="1.67" rx="0.8" fill="white" transform="rotate(45 6.335 6.335)" />
            <rect x="3" y="5.5" width="7" height="1.67" rx="0.8" fill="white" transform="rotate(-45 6.335 6.335)" />
          </svg>
        </span>
      ),
    },
    {
      key: "pending",
      label: "Pending",
      className:
        activeFilter === "pending"
          ? "bg-[#FB923C] border border-[#FB923C] text-white w-[140px]"
          : "bg-white border border-[#FB923C] text-[#FB923C] w-[140px]",
      icon: (
        <span className="absolute left-[12px] flex items-center justify-center" style={{ width: 19, height: 19, top: '50%', transform: 'translateY(-50%)' }}>
          <span style={{ background: '#FF9D00', borderRadius: '50%', width: 19, height: 19, display: 'block', position: 'absolute', left: 0, top: 0 }}></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" style={{ position: 'absolute', left: 3.17, top: 3.17 }}>
            <rect x="5.5" y="3" width="1.67" height="5.5" rx="0.8" fill="white" />
            <rect x="5.5" y="9.2" width="1.67" height="1.67" rx="0.8" fill="white" />
          </svg>
        </span>
      ),
    },
  ];

  const filteredOrders = activeFilter === "all" ? orders : orders.filter(o => o.status === activeFilter);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="w-fit">
          <BackButton href="/account-dashboard" />
        </div>
        <div className="text-[#E73828] text-[36px] font-semibold font-['Roboto'] leading-[42px] uppercase mb-8 mt-0 tracking-tight">MY ORDERS</div>
      </div>
      <div className="flex flex-col items-start w-full pb-6 gap-[25px] border-b border-[rgba(0,0,0,0.1)] mb-8" style={{ boxSizing: 'border-box' }}>
        <div className="flex flex-row items-start gap-4" style={{ height: '35px' }}>
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              className={`flex flex-row items-center rounded-[50.5px] px-[12px] py-[8px] font-['Roboto'] font-semibold text-[16px] h-[35px] justify-center items-center relative ${btn.className}`}
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
        {filteredOrders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </DashboardLayout>
  );
} 