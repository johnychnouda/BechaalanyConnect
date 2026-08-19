import React, { useState } from 'react'
import { formatDate } from "@/utils/date";
import { generateOrderReceiptFromProcessedOrder } from "@/utils/pdf-generator";
import { useRouter } from 'next/router';
import ReceiptPreviewModal from '@/components/ui/receipt-preview-modal';
import OrderCodes from '@/components/ui/order-codes';

export interface ProcessedOrder {
  id: number;
  status: 'accepted' | 'rejected' | 'pending';
  title: string;
  value: string;
  date: string;
  quantity: number;
  recipient_info: string;
  code?: string;
  Customer?: {
    username: string;
    email: string;
    phone_number: string;
    country?: string;
    business_location?: string;
    business_name?: string;
  }
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
  const meta = statusMeta[order.status];
  const { locale } = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);


  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleDownload = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      await generateOrderReceiptFromProcessedOrder(order, locale);
      setShowPreview(false); // Close modal after successful download
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You could add a toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex flex-row flex-wrap justify-between items-center p-[12px_16px] gap-[10px] w-full bg-[rgba(7,7,7,0.05)]  rounded-[20px] mb-2">
        {/* Left Section - Icon, Title, Date */}
        <div className="flex flex-row items-start md:items-center p-0 gap-4 ">
          {/* Icon Circle */}
          <div className="relative w-9 h-9">
            <div className={`absolute w-9 h-9 rounded-full`} style={{ background: meta.color }}></div>
            <span className="absolute left-[6px] top-[6px]">{meta.icon}</span>
          </div>
          {/* Title and Date */}

          <div className="flex flex-col justify-center items-start p-0 gap-1">
            <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center p-0 gap-1 text-wrap">
              <span className=" font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] dark:text-white">
                {order.title.split(' | ')[0]}
              </span>
              {order.title.includes(' | ') && (
                <>
                  <span className="hidden md:block w-[1px] h-3 bg-[#E73828]"></span>
                  <span className="font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] dark:text-white">
                    {order.title.split(' | ')[1]}
                  </span>
                </>
              )}
            </div>
            {
              order?.status === 'accepted' && order?.code && (
                <OrderCodes
                  htmlContent={order.code}
                  className="text-xs font-normal mt-3"
                  locale={locale || 'en'}
                />
              )
            }
            <div>
              <span className="h-[14px] font-['Roboto'] font-normal text-xs leading-[14px] text-[#8E8E8E]">
                {formatDate(order.date)}
              </span>
            </div>

            <div className="block sm:hidden">

              <div className="flex flex-row justify-end items-center gap-3">
                {/* Price */}
                <div className="h-[19px] font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] dark:text-white text-right">
                  {order.value}
                </div>
                {/* Export PDF Button */}
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#E73828] hover:bg-[#d32f2f] text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Click to preview receipt before downloading PDF"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <path d="M12 15v-6M9 12l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="hidden md:block text-xs font-medium">
                    {locale === 'en' ? 'Export' : 'تحميل'}
                  </span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Section - Price and Export Button */}
        <div className="hidden flex-row justify-end items-center gap-3 sm:flex">
          {/* Price */}
          <div className="h-[19px] font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] dark:text-white text-right">
            {order.value}
          </div>
          {/* Export PDF Button */}
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#E73828] hover:bg-[#d32f2f] text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            title="Click to preview receipt before downloading PDF"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <path d="M12 15v-6M9 12l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden md:block text-xs font-medium">
              {locale === 'en' ? 'Export' : 'تحميل'}
            </span>
          </button>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        order={order}
        onDownload={handleDownload}
        isDownloading={isExporting}
        locale={locale}
      />
    </>
  );
}

export default orderRow