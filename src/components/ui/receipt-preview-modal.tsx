import React, { useState, useEffect } from 'react';
import { ProcessedOrder } from '@/pages/account-dashboard/orderRow';
import { formatDate } from '@/utils/date';

interface ReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ProcessedOrder | null;
  onDownload: () => void;
  isDownloading: boolean;
  locale?: string;
}

export default function ReceiptPreviewModal({
  isOpen,
  onClose,
  order,
  onDownload,
  isDownloading,
  locale
}: ReceiptPreviewModalProps) {
  const [customerInfo, setCustomerInfo] = useState<{ name: string; email: string; phone: string } | null>(null);

  useEffect(() => {
    if (order?.Customer) {
      // User data is directly available in the order
      setCustomerInfo({
        name: order.Customer.username || '',
        email: order.Customer.email || '',
        phone: order.Customer.phone_number || ''
      });
    } else {
      setCustomerInfo(null);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  // Calculate unit price from total price and quantity
  const totalPrice = parseFloat(order.value.replace('$', ''));
  const unitPrice = totalPrice / order.quantity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {
              locale === 'ar' ? 'معاينة الفاتورة' : 'Receipt Preview'
            }
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6">
          {/* Company Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#E73828] mb-2">
              Bechaalany Connect
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {
                locale === 'ar' ? 'فاتورة الطلب' : 'Order Receipt'
              }
            </p>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{ locale === 'ar' ? 'تفاصيل الفاتورة' : 'Receipt Details' }</h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>{ locale === 'ar' ? 'رقم الطلب' : 'Order ID' }: #{order.id}</p>
                <p>{ locale === 'ar' ? 'التاريخ' : 'Date' }: {formatDate(order.date)}</p>
                <p>{ locale === 'ar' ? 'الحالة' : 'Status' }: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{ locale === 'ar' ? 'معلومات المنتج' : 'Product Information' }</h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>{ locale === 'ar' ? 'المنتج' : 'Product' }: {order.title.split(' | ')[0]}</p>
                <p>{ locale === 'ar' ? 'التغيير' : 'Variation' }: {order.title.split(' | ')[1] || 'Standard'}</p>
                <p>{ locale === 'ar' ? 'الكمية' : 'Quantity' }: {order.quantity}</p>
              </div>
            </div>
          </div>

          {/* Pricing Table */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{ locale === 'ar' ? 'تفاصيل السعر' : 'Pricing Details' }</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">{ locale === 'ar' ? 'السعر الوحدة' : 'Unit Price' }:</span>
                <span className="font-medium">${unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">{ locale === 'ar' ? 'الكمية' : 'Quantity' }:</span>
                <span className="font-medium">{order.quantity}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 dark:text-white">{ locale === 'ar' ? 'المجموع' : 'Total' }:</span>
                  <span className="font-bold text-lg text-[#E73828]">{order.value}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {/* {customerInfo && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Customer Information</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                {customerInfo.name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="font-medium">{customerInfo.name}</span>
                  </div>
                )}
                {customerInfo.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-medium">{customerInfo.email}</span>
                  </div>
                )}
                {customerInfo.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                    <span className="font-medium">{customerInfo.phone}</span>
                  </div>
                )}
                {order.Customer?.country && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Country:</span>
                    <span className="font-medium">{order.Customer.country}</span>
                  </div>
                )}
                {order.Customer?.business_location && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Business Location:</span>
                    <span className="font-medium">{order.Customer.business_location}</span>
                  </div>
                )}
                {order.Customer?.business_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Business Name:</span>
                    <span className="font-medium">{order.Customer.business_name}</span>
                  </div>
                )}
              </div>
            </div>
          )} */}

          {/* Recipient Information */}
          {order.recipient_info && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{ locale === 'ar' ? 'معلومات المستلم' : 'Recipient Information' }</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                {order.recipient_info}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            <p>{ locale === 'ar' ? 'شكرا لك على عمليتك الشراء!' : 'Thank you for your purchase!' }</p>
            <p>{ locale === 'ar' ? 'للدعم، يرجى الاتصال بفريق خدمة العملاء.' : 'For support, contact our customer service team.' }</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            { locale === 'ar' ? 'إلغاء' : 'Cancel' }
          </button>
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="flex-1 px-4 py-2 bg-[#E73828] text-white rounded-lg hover:bg-[#d32f2f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{ locale === 'ar' ? 'جاري التحميل...' : 'Downloading...' }</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{ locale === 'ar' ? 'تحميل PDF' : 'Download PDF' }</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
