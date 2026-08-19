import React from 'react'
import { formatDate } from "@/utils/date";

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

function PaymentRow({ payment, expanded, onToggle, locale }: {
    payment: {
        id: number;
        status: 'accepted' | 'rejected' | 'pending';
        title: string;
        value: string;
        date: string;
        screenshot: string | null;
        rejected_reason: string | null;
    }; expanded: boolean; onToggle: () => void; locale: string;
}) {

    const meta = statusMeta[payment.status as 'accepted' | 'rejected' | 'pending'];
    return (
        <div className="bg-[#F3F3F3] rounded-[20px] mb-4 w-full shadow-none">
            <div className="flex items-center px-6 py-4 cursor-pointer" onClick={onToggle}>
                <span className="mr-4 rtl:ml-4 rtl:mr-0">{meta.icon}</span>
                <span className="font-['Roboto'] font-normal text-[16px] text-[#070707]">{payment.title}</span>
                <span className="ml-auto rtl:ml-0 rtl:mr-auto text-xs text-[#8E8E8E]">{formatDate(payment.date)}</span>
                <span className="ml-4 rtl:mr-4 rtl:ml-0">
                    <svg className={`transition-transform ${expanded ? 'rotate-180' : ''}`} width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="#E73828" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
            </div>
            {expanded && (
                <div className="px-6 pb-4 pt-0 animate-fade-in">
                    <div className="flex flex-col gap-2 mb-2 text-right">
                        <div className="flex flex-row justify-between items-center">
                            <span className="text-[16px] text-[#070707] font-normal">{locale === 'en' ? 'Total' : 'المبلغ'}</span>
                            <span className="text-[16px] text-[#8E8E8E] font-normal">{payment.value}</span>
                        </div>
                        <div className="flex flex-row justify-between items-center">
                            <span className="text-[16px] text-[#070707] font-normal">{locale === 'en' ? 'Date' : 'التاريخ'}</span>
                            <span className="text-[16px] text-[#8E8E8E] font-normal">{formatDate(payment.date)}</span>
                        </div>
                        {payment.rejected_reason && (
                            <div className="flex flex-row justify-between items-center">
                                <span className="text-[16px] text-[#070707] font-normal">{locale === 'en' ? 'Rejection Reason' : 'سبب الرفض'}</span>
                                <span className="text-[16px] text-[#8E8E8E] font-normal">{payment.rejected_reason}</span>
                            </div>
                        )}
                    </div>
                    {payment.screenshot && (
                        <div className="mt-4 flex flex-col items-start">
                            <span className="block text-[16px] text-[#070707] mb-1">{locale === 'en' ? 'Screenshot' : 'الشاشة'}</span>
                            <img src={payment.screenshot} alt="Payment Screenshot" className="rounded-lg border border-[#E0E0E0] w-[267px] h-[475px] object-contain" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


export default PaymentRow;