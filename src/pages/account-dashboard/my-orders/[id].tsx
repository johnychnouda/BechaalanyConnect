import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/ui/dashboard-layout';
import BackButton from '@/components/ui/back-button';
import ImageWithFallback from '@/components/ui/image-with-fallback';
import OrderCodes from '@/components/ui/order-codes';
import ReceiptPreviewModal from '@/components/ui/receipt-preview-modal';
import OrderStatusTimeline from '@/components/dashboard/orderStatusTimeline';
import { fetchUserOrder } from '@/services/api.service';
import { generateOrderReceiptFromProcessedOrder } from '@/utils/pdf-generator';
import { formatDate } from '@/utils/date';
import { toMessage } from '@/utils/error-message';
import { isApiError } from '@/utils/api';
import { toProcessedOrder } from '@/utils/order';
import { useLanguage } from '@/hooks/use-language';
import { useGlobalContext } from '@/context/GlobalContext';
import type { Order } from '@/context/AuthContext';

const PENDING = 3;

export default function OrderDetailPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const { generalData } = useGlobalContext();
  const { id } = router.query;
  const orderId = typeof id === 'string' ? id : undefined;

  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const {
    data: order,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<Order>({
    queryKey: ['user-order', locale, orderId],
    queryFn: () => fetchUserOrder(locale, orderId as string),
    enabled: !!orderId,
    // Without this, react-query's default networkMode:'online' can leave the query
    // stuck at fetchStatus:'paused' forever whenever its internal onlineManager
    // believes the browser is offline — reproduced even with navigator.onLine === true
    // and a same-origin request that succeeds when made directly. A paused query is
    // neither loading nor errored nor has data, so the page fell through to the
    // generic error state and never recovered, even on a manual retry.
    networkMode: 'always',
    // The default retry (1, set globally in _app.tsx) reopens a second version of the
    // same gap: retrying reissues the fetch after a backoff delay, and if this query's
    // last observer goes away before that retry settles (route change, remount —
    // anything that drops the subscriber), react-query discards the outcome, leaving
    // the query permanently neither loading, errored, nor holding data. A single
    // resource fetch that 404s is not worth a delayed second attempt anyway; failing
    // once, immediately, is what lets `notFound` and the error branch below fire.
    retry: false,
    // The whole point of this page: watch just the order that was placed instead of
    // refetching the entire My Orders list every 3 minutes. Polling stops the moment
    // an admin decides — nothing left to watch once the order is accepted or rejected.
    refetchInterval: (query) => {
      const current = query.state.data as Order | undefined;
      return current && current.statuses_id === PENDING ? 15000 : false;
    },
  });

  const notFound = isApiError(error) && error.status === 404;

  // router.query.id is empty on a hard load until Next.js finishes hydrating the
  // dynamic route (router.isReady flips true once it is populated). Until then
  // orderId is undefined, the query stays enabled:false, and isLoading is FALSE
  // (nothing is fetching) — so without this check the page fell straight through to
  // the generic error state ("!order") on every direct visit or reload, even though
  // nothing had actually failed yet.
  if (isLoading || !router.isReady || !orderId) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E73828]" />
        </div>
      </DashboardLayout>
    );
  }

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="w-fit mb-6">
          <BackButton href="/account-dashboard/my-orders" label={generalData?.settings?.back_button_label} />
        </div>
        <div className="text-center py-16">
          <p className="text-gray-500 mb-3">
            {locale === 'en' ? "This order doesn't exist or isn't yours." : 'هذا الطلب غير موجود أو لا يخصك.'}
          </p>
          <button
            onClick={() => router.push('/account-dashboard/my-orders')}
            className="px-5 py-2 rounded-[25px] bg-[#E73828] text-white text-sm font-medium hover:bg-[#d63224] transition-colors"
          >
            {locale === 'en' ? 'Back to My Orders' : 'العودة إلى طلباتي'}
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !order) {
    return (
      <DashboardLayout>
        <div className="w-fit mb-6">
          <BackButton href="/account-dashboard/my-orders" label={generalData?.settings?.back_button_label} />
        </div>
        <div className="text-center py-16">
          <p className="text-[#E73828] mb-3">{toMessage(error, locale)}</p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 rounded-[25px] bg-[#E73828] text-white text-sm font-medium hover:bg-[#d63224] transition-colors"
          >
            {locale === 'en' ? 'Try again' : 'إعادة المحاولة'}
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const processed = toProcessedOrder(order);
  const isPending = order.statuses_id === PENDING;
  const isRejected = order.statuses_id === 2;
  const isAccepted = order.statuses_id === 1;
  const unitPrice = parseFloat(order.total_price) / (order.quantity || 1);

  const handleDownload = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await generateOrderReceiptFromProcessedOrder(processed, locale);
      setShowPreview(false);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4">
          <div className="w-fit">
            <BackButton href="/account-dashboard/my-orders" label={generalData?.settings?.back_button_label} />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-[#E73828] text-2xl md:text-[32px] font-semibold font-['Roboto'] uppercase tracking-tight">
              {locale === 'en' ? `Order #${order.id}` : `الطلب #${order.id}`}
            </h1>
            {isFetching && !isLoading && (
              <span className="w-2 h-2 rounded-full bg-[#FB923C] animate-pulse" title={locale === 'en' ? 'Checking for updates…' : 'جارٍ التحقق من التحديثات...'} />
            )}
          </div>
        </div>

        {/* Status timeline */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 bg-white dark:bg-[#2a2a2a] overflow-x-auto">
          <OrderStatusTimeline status={processed.status} placedAt={formatDate(order.created_at)} locale={locale} />

          {isPending && (
            <p className="text-sm text-[#8E8E8E] dark:text-[#a0a0a0] mt-4">
              {locale === 'en'
                ? 'Your order is being reviewed. This page will update on its own once a decision is made.'
                : 'طلبك قيد المراجعة. سيتم تحديث هذه الصفحة تلقائياً فور اتخاذ القرار.'}
            </p>
          )}
          {isRejected && (
            <p className="text-sm text-[#E73828] mt-4">
              {locale === 'en'
                ? 'This order was rejected and the full amount has been returned to your credits balance.'
                : 'تم رفض هذا الطلب وتمت إعادة كامل المبلغ إلى رصيدك.'}
            </p>
          )}
        </div>

        {/* Product summary */}
        <div className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
          <div className="relative w-full sm:w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
            <ImageWithFallback
              src={order.product_variation?.product?.full_path?.image}
              alt={order.product_variation?.product?.name || 'Product'}
              fill
              className="object-cover"
              placeholderClassName="p-4"
            />
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <div>
              <div className="text-lg font-semibold text-[#070707] dark:text-white">
                {order.product_variation?.product?.name}
              </div>
              <div className="text-sm text-[#8E8E8E]">{order.product_variation?.name}</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-[#8E8E8E] text-xs">{locale === 'en' ? 'Quantity' : 'الكمية'}</div>
                <div className="text-[#070707] dark:text-white font-medium">{order.quantity}</div>
              </div>
              <div>
                <div className="text-[#8E8E8E] text-xs">{locale === 'en' ? 'Unit price' : 'سعر الوحدة'}</div>
                <div className="text-[#070707] dark:text-white font-medium">${unitPrice.toFixed(2)}</div>
              </div>
              {processed.recipient_info && (
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-[#8E8E8E] text-xs">{locale === 'en' ? 'Recipient' : 'المستلم'}</div>
                  <div className="text-[#070707] dark:text-white font-medium break-all">{processed.recipient_info}</div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center bg-app-red/5 rounded-xl px-4 py-3 mt-1">
              <span className="text-sm text-[#070707] dark:text-white">{locale === 'en' ? 'Total' : 'الإجمالي'}</span>
              <span className="text-lg font-semibold text-[#E73828]">{processed.value}</span>
            </div>
          </div>
        </div>

        {/* Delivered codes */}
        {isAccepted && order.code && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 bg-white dark:bg-[#2a2a2a]">
            <OrderCodes htmlContent={order.code} locale={locale} />
          </div>
        )}

        {/* Receipt */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E73828] hover:bg-[#d32f2f] text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <path d="M12 15v-6M9 12l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {locale === 'en' ? 'View receipt' : 'عرض الفاتورة'}
          </button>
        </div>
      </div>

      <ReceiptPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        order={processed}
        onDownload={handleDownload}
        isDownloading={isExporting}
        locale={locale}
      />
    </DashboardLayout>
  );
}
