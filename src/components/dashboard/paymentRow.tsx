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
        <div className="bg-[#F3F3F3] dark:bg-gray-800 rounded-[20px] mb-4 w-full shadow-none">
            <button
                type="button"
                aria-expanded={expanded}
                className="w-full flex items-center px-6 py-4 cursor-pointer text-left rtl:text-right"
                onClick={onToggle}
            >
                <span className="mr-4 rtl:ml-4 rtl:mr-0">{meta.icon}</span>
                <span className="font-normal text-[16px] text-app-black dark:text-white">{payment.title}</span>
                <span className="ml-auto rtl:ml-0 rtl:mr-auto text-xs text-neutral-400">{formatDate(payment.date)}</span>
                <span className="ml-4 rtl:mr-4 rtl:ml-0 text-app-red">
                    <svg className={`transition-transform ${expanded ? 'rotate-180' : ''}`} width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
            </button>
            {expanded && (
                <div className="px-6 pb-4 pt-0 animate-fade-in">
                    <div className="flex flex-col gap-2 mb-2 text-right">
                        <div className="flex flex-row justify-between items-center">
                            <span className="text-[16px] text-app-black dark:text-white font-normal">{locale === 'en' ? 'Total' : 'المبلغ'}</span>
                            <span className="text-[16px] text-neutral-400 font-normal">{payment.value}</span>
                        </div>
                        <div className="flex flex-row justify-between items-center">
                            <span className="text-[16px] text-app-black dark:text-white font-normal">{locale === 'en' ? 'Date' : 'التاريخ'}</span>
                            <span className="text-[16px] text-neutral-400 font-normal">{formatDate(payment.date)}</span>
                        </div>
                        {payment.rejected_reason && (
                            <div className="flex flex-row justify-between items-center">
                                <span className="text-[16px] text-app-black dark:text-white font-normal">{locale === 'en' ? 'Rejection Reason' : 'سبب الرفض'}</span>
                                <span className="text-[16px] text-neutral-400 font-normal">{payment.rejected_reason}</span>
                            </div>
                        )}
                    </div>
                    {payment.screenshot && (
                        <div className="mt-4 flex flex-col items-start">
                            <span className="block text-[16px] text-app-black dark:text-white mb-1">{locale === 'en' ? 'Screenshot' : 'الشاشة'}</span>
                            {/*
                              This is a signed, time-limited URL
                              (CreditsController::receipt — expires 30 min
                              after issue), served straight from the API host,
                              which is why it stays a plain <img> rather than
                              next/image (whose optimizer caches the fetched
                              result independently of that expiry). The actual
                              bug was the fixed `w-[267px] h-[475px]`, which
                              overflowed a 320px-wide phone screen regardless
                              of the real image's aspect ratio — max-width
                              100% with height auto scales it to the
                              container instead.
                            */}
                            <img
                                src={payment.screenshot}
                                alt="Payment Screenshot"
                                className="rounded-lg border border-neutral-200 max-w-[267px] w-full h-auto object-contain"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


export default PaymentRow;
