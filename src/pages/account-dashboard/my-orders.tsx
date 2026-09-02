import DashboardLayout from "@/components/ui/dashboard-layout";
import React, { useState, useMemo, useEffect } from "react";
import BackButton from "@/components/ui/back-button";
import { Order, useAuth } from "@/context/AuthContext";
import { ProcessedOrder } from "@/components/dashboard/orderRow";
import OrderRow from "@/components/dashboard/orderRow";
import { fetchUserOrders } from "@/services/api.service";
import { useGlobalContext } from "@/context/GlobalContext";
import { generateBulkOrderReceipts } from "@/utils/pdf-generator";
import { useRouter } from "next/router";
import { useLanguage } from "@/hooks/use-language";
import { toMessage } from "@/utils/error-message";
import { toProcessedOrder } from "@/utils/order";

const ITEMS_PER_PAGE = 10; // Rows requested per page from the API

export default function MyOrders() {
  const { user } = useAuth();
  const router = useRouter();
  const { setRefreshOrdersCallback } = useGlobalContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { dashboardSettings, generalData } = useGlobalContext();
  const { locale } = useLanguage();

  /**
   * Fetch one page of orders.
   *
   * This used to call fetchUserOrders(locale) with no page argument — so it always
   * received page 1 (10 rows) — and "Load More" then re-sliced that same array. A
   * customer with more than 10 orders could never reach the 11th, and the button
   * ended with a permanent "No more orders to load".
   */
  const fetchOrders = async (requestedPage = 1, isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) {
        setAutoRefreshing(true);
      } else if (requestedPage === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setError(null);

      const response = await fetchUserOrders(router.locale, requestedPage, ITEMS_PER_PAGE);
      const incoming: Order[] = response.orders || [];

      // Append when paging, replace when (re)loading the first page.
      setOrders((previous) =>
        requestedPage === 1 ? incoming : [...previous, ...incoming]
      );
      setPage(response.current_page || requestedPage);
      setLastPage(response.last_page || 1);
    } catch (err) {
      // Genuinely surfaced now. api.service used to return an empty list on failure,
      // so this branch never ran and an outage rendered as "No orders found." —
      // indistinguishable from having no orders at all.
      console.error('Error fetching orders:', err);
      setError(toMessage(err, router.locale));
    } finally {
      setLoading(false);
      setAutoRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  // Refetch when the locale changes: product and variation names are translated
  // server-side, so switching to Arabic previously left the old language on screen
  // until a hard refresh (the dependency array was empty while the body read
  // router.locale).
  useEffect(() => {
    setPage(1);
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.locale]);

  // Register refresh function with global context
  useEffect(() => {
    setRefreshOrdersCallback(() => fetchOrders);
  }, [setRefreshOrdersCallback]);

  // Auto-refresh orders every 30 seconds when user is on the page
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(1, true);
    }, 180000); //3min

    return () => clearInterval(interval);
  }, []);

  // Process orders from API data
  const processedOrders: ProcessedOrder[] = useMemo(() => {
    if (!orders || !Array.isArray(orders)) {
      return [];
    }

    return orders.map(toProcessedOrder);
  }, [orders]);


  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filterButtons = [
    {
      key: "all",
      label: dashboardSettings?.dashboard_page_settings?.all_payments_label,
      className: activeFilter === "all"
        ? "bg-[#F3F3F3] border border-[#E0E0E0] text-[#070707]"
        : "bg-white border border-[#E0E0E0] text-[#070707]",
      icon: null,
    },
    {
      key: "accepted",
      label: dashboardSettings?.dashboard_page_settings?.accepted_label,
      className: activeFilter === "accepted"
        ? "bg-[#5FD568] border border-[#5FD568] text-white"
        : "bg-white border border-[#5FD568] text-[#5FD568]",
      icon: (
        <span className="absolute left-[12px] flex items-center justify-center" style={{ width: '19px', height: '19px', top: '50%', transform: 'translateY(-50%)' }}>
          <span style={{ background: '#5FD568', borderRadius: '50%', width: '19px', height: '19px', display: 'block', position: 'absolute', left: 0, top: 0 }}></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" style={{ position: 'absolute', left: '3.17px', top: '3.17px' }}>
            <path d="M3.5 7.5L6 10L10 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ),
    },
    {
      key: "rejected",
      label: dashboardSettings?.dashboard_page_settings?.rejected_label,
      className: activeFilter === "rejected"
        ? "bg-[#E73828] border border-[#E73828] text-white"
        : "bg-white border border-[#E73828] text-[#E73828]",
      icon: (
        <span className="absolute left-[12px] flex items-center justify-center" style={{ width: '19px', height: '19px', top: '50%', transform: 'translateY(-50%)' }}>
          <span style={{ background: '#E73828', borderRadius: '50%', width: '19px', height: '19px', display: 'block', position: 'absolute', left: 0, top: 0 }}></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" style={{ position: 'absolute', left: '3.17px', top: '3.17px' }}>
            <rect x="3" y="5.5" width="7" height="1.67" rx="0.8" fill="white" transform="rotate(45 6.335 6.335)" />
            <rect x="3" y="5.5" width="7" height="1.67" rx="0.8" fill="white" transform="rotate(-45 6.335 6.335)" />
          </svg>
        </span>
      ),
    },
    {
      key: "pending",
      label: dashboardSettings?.dashboard_page_settings?.pending_label,
      className: activeFilter === "pending"
        ? "bg-[#FB923C] border border-[#FB923C] text-white"
        : "bg-white border border-[#FB923C] text-[#FB923C]",
      icon: (
        <span className="absolute left-[12px] flex items-center justify-center" style={{ width: '19px', height: '19px', top: '50%', transform: 'translateY(-50%)' }}>
          <span style={{ background: '#FF9D00', borderRadius: '50%', width: '19px', height: '19px', display: 'block', position: 'absolute', left: 0, top: 0 }}></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" style={{ position: 'absolute', left: '3.17px', top: '3.17px' }}>
            <rect x="5.5" y="3" width="1.67" height="5.5" rx="0.8" fill="white" />
            <rect x="5.5" y="9.2" width="1.67" height="1.67" rx="0.8" fill="white" />
          </svg>
        </span>
      ),
    },
  ];

  const filteredOrders = activeFilter === "all" ? processedOrders : processedOrders.filter((o: ProcessedOrder) => o.status === activeFilter);

  // Everything fetched so far is shown; paging is driven by the API, not by slicing.
  const displayedOrders = filteredOrders;

  // There is genuinely more on the server, rather than "more of what we already hold".
  const hasMoreItems = page < lastPage;

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMoreItems) return;
    fetchOrders(page + 1);
  };

  // const handleBulkExport = async () => {
  //   if (filteredOrders.length === 0 || isBulkExporting) return;
    
  //   setIsBulkExporting(true);
  //   try {
  //     await generateBulkOrderReceipts(filteredOrders);
  //   } catch (error) {
  //     console.error('Error bulk exporting orders:', error);
  //     // You could add a toast notification here for better user feedback
  //   } finally {
  //     setIsBulkExporting(false);
  //   }
  // };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-0 md:gap-0">
        <div className="w-fit mb-6 md:mb-8">
          <BackButton label={generalData?.settings?.back_button_label} />
        </div>
        <div className="text-[#E73828] text-[36px] font-semibold font-['Roboto'] leading-[42px] uppercase mt-0 tracking-tight">{dashboardSettings?.dashboard_page_settings?.my_orders_page_title}</div>
      </div>
      <div className="flex flex-col lg:flex-row items-start md:justify-between w-full pb-6 gap-[25px] border-b border-[rgba(0,0,0,0.1)] mb-8" style={{ boxSizing: 'border-box' }}>
        <div className="flex flex-row w-full lg:w-auto gap-2 overflow-x-auto whitespace-nowrap" style={{ minHeight: '35px' }}>
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              className={`flex items-center rounded-[50.5px] px-3 py-2 font-['Roboto'] font-semibold text-[15px] h-[35px] ${btn.className}`}
              style={{ minWidth: '140px', maxWidth: '160px' }}
              onClick={() => handleFilterChange(btn.key)}
              type="button"
            >
              {btn.icon && (
                <span className="flex items-center justify-center mr-3" style={{ width: 19, height: 19, position: 'relative' }}>
                  {btn.icon}
                </span>
              )}
              <span className="flex-1 text-center truncate">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Bulk Export Button */}
          {/* {filteredOrders.length > 0 && (
            <button
              onClick={handleBulkExport}
              disabled={loading || isBulkExporting}
              className="flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              title={`Export ${filteredOrders.length} order${filteredOrders.length > 1 ? 's' : ''} as PDF`}
            >
              {isBulkExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
              <span className="font-medium">
                {isBulkExporting ? 'Exporting...' : `Export All (${filteredOrders.length})`}
              </span>
            </button>
          )} */}
          
          {/* Refresh Button */}
          <button
            onClick={() => fetchOrders(1)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#E73828] text-white rounded-lg hover:bg-[#d32f2f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
            )}
            {dashboardSettings?.dashboard_page_settings?.refresh_order_button}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Auto-refresh indicator */}
      {autoRefreshing && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm flex items-center gap-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          {
            locale === 'en' ? 'Auto-refreshing orders...' : 'جاري التحديث...'
          }
        </div>
      )}

      <div className="flex flex-col gap-4 w-full">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E73828]"></div>
          </div>
        ) : error ? (
          /* A real error state. Previously an outage fell through to "No orders
             found." because api.service returned an empty list instead of throwing,
             so the customer was told they had no orders when in fact we could not
             reach the server. */
          <div className="text-center py-8">
            <p className="text-[#E73828] mb-3">{error}</p>
            <button
              onClick={() => fetchOrders(1)}
              className="px-5 py-2 rounded-[25px] bg-[#E73828] text-white text-sm font-medium hover:bg-[#d63224] transition-colors"
            >
              {locale === 'en' ? 'Try again' : 'إعادة المحاولة'}
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-3">{locale === 'en' ? 'No orders found.' : 'لا يوجد طلبات مضافة'}</p>
            {/* A dead end otherwise: the empty state offered no way forward. */}
            <button
              onClick={() => router.push('/categories')}
              className="px-5 py-2 rounded-[25px] bg-[#E73828] text-white text-sm font-medium hover:bg-[#d63224] transition-colors"
            >
              {locale === 'en' ? 'Browse products' : 'تصفح المنتجات'}
            </button>
          </div>
        ) : (
          <>
            {displayedOrders.map((order: ProcessedOrder) => (
              <OrderRow key={order.id} order={order} />
            ))}

            {/* Load More Button */}
            {hasMoreItems && (
              <div className="w-full flex justify-center items-center py-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#E73828] hover:bg-[#d63224] disabled:bg-[#E73828]/50 text-white font-['Roboto'] font-medium text-base rounded-[25px] transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{locale === 'en' ? 'Loading...' : 'جاري التحديث...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{locale === 'en' ? 'Load More' : 'تحميل المزيد'}</span>
                      <span className="text-sm opacity-75">
                        ({locale === 'en' ? `page ${page + 1} of ${lastPage}` : `صفحة ${page + 1} من ${lastPage}`})
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Only shown once there is genuinely more than one page — it used to
                appear under every list, including a list of two orders. */}
            {!hasMoreItems && lastPage > 1 && (
              <div className="w-full flex justify-center items-center py-4">
                <span className="font-['Roboto'] font-normal text-sm text-[#8E8E8E] dark:text-[#a0a0a0]">
                  {locale === 'en' ? 'No more orders to load' : 'لا يوجد طلبات مضافة أخرى'}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 