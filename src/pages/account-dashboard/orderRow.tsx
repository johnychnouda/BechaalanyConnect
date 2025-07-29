import React from 'react'
import { formatDate } from "@/utils/date";

export interface ProcessedOrder {
  id: number;
  status: 'accepted' | 'rejected' | 'pending';
  title: string;
  value: string;
  date: string;
  quantity: number;
  recipient_info: string;
}



const statusMeta = {
  accepted: {
    color: "#5FD568", label: "Accepted", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#5FD568" /><path d="M7 13.5L11 17L17 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    )
  },
  rejected: {
    color: "#E73828", label: "Rejected", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#E73828" /><path d="M8 8L16 16M16 8L8 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    )
  },
  pending: {
    color: "#FB923C", label: "Pending", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#FB923C" /><path d="M12 7V12L15 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    )
  },
};

function orderRow({ order }: { order: ProcessedOrder }) {
  console.log("order", order);
  const meta = statusMeta[order.status];
  return (
    <div className="flex flex-row justify-between items-center p-[12px_16px] gap-[10px] w-full h-[61px] bg-[rgba(7,7,7,0.05)] rounded-[50.5px] mb-2">
      {/* Left Section - Icon, Title, Date */}
      <div className="flex flex-row items-center p-0 gap-4 h-[37px]">
        {/* Icon Circle */}
        <div className="relative w-9 h-9">
          <div className={`absolute w-9 h-9 rounded-full`} style={{ background: meta.color }}></div>
          <span className="absolute left-[6px] top-[6px]">{meta.icon}</span>
        </div>
        {/* Title and Date */}
        <div className="flex flex-col justify-center items-start p-0 gap-1 h-[37px]">
          <div className="flex flex-row items-center p-0 gap-1 h-[19px]">
            <span className="h-[19px] font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] dark:text-white">
              {order.title.split(' | ')[0]}
            </span>
            {order.title.includes(' | ') && (
              <>
                <span className="w-[1px] h-3 bg-[#E73828]"></span>
                <span className="h-[19px] font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] dark:text-white">
                  {order.title.split(' | ')[1]}
                </span>
              </>
            )}
          </div>
          <span className="h-[14px] font-['Roboto'] font-normal text-xs leading-[14px] text-[#8E8E8E]">
            {formatDate(order.date)}
          </span>
        </div>
      </div>
      {/* Right Section - Price */}
      <div className="flex flex-row justify-end items-center gap-2 ">
        <div className="h-[19px] font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] dark:text-white text-right">
          {order.value}
        </div>
      </div>
    </div>
  );
}

export default orderRow