import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "@/components/ui/dashboard-layout";
import TransactionFilter from "@/components/general/TransactionFilter";
import { formatDate } from "@/utils/date";
import { motion } from 'framer-motion';

import BackButton from "@/components/ui/back-button";
import { fetchUserOrders, fetchUserPayments, fetchCurrentUser } from "@/services/api.service";
import { useRouter } from "next/router";
import { useGlobalContext } from "@/context/GlobalContext";
import { useLanguage } from "@/hooks/use-language";
import { toast } from "react-toastify";


const ITEMS_PER_PAGE = 5; // Number of items to show initially and per load more

export default function AccountDashboard() {
  const { dashboardSettings } = useGlobalContext();
  const router = useRouter();
  const { locale } = useLanguage();

  // Profile data state
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [displayedItemsCount, setDisplayedItemsCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string } | null>(null);
  const [hasError, setHasError] = useState(false);

  // Simplified request tracking - removed auto-refresh cache logic
  const [isFetching, setIsFetching] = useState(false);
  const lastRequestTimeRef = useRef<number>(0);
  const MIN_REQUEST_INTERVAL = 2000; // Minimum 2 seconds between requests
  const hasDataRef = useRef<boolean>(false); // Track if we have data without causing re-renders





  // Fetch profile data directly from API on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoadingProfile(true);
      setProfileError(null);

      try {
        const freshProfileData = await fetchCurrentUser(locale);
        setProfileData(freshProfileData.user);
      } catch (error) {
        setProfileError('Failed to load profile data. Please refresh the page.');
        toast.error('Failed to load profile data. Please refresh the page.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [locale]);

  const fetchOrdersAndPayments = useCallback(async () => {

    // Prevent multiple simultaneous requests
    if (isFetching) {
      return;
    }

    // Rate limiting: prevent requests more frequent than MIN_REQUEST_INTERVAL
    const now = Date.now();
    if (now - lastRequestTimeRef.current < MIN_REQUEST_INTERVAL) {
      return;
    }

    setIsFetching(true);
    setIsLoading(true);
    lastRequestTimeRef.current = now;

    try {

      // Fetch orders and payments in parallel
      const [ordersResponse, paymentsResponse] = await Promise.all([
        fetchUserOrders(router.locale),
        fetchUserPayments(router.locale)
      ]);

      const processedOrders = (ordersResponse.orders || [])
        .filter((order: any) => order.statuses_id === 1)
        .map((order: any) => {
          let status: 'accepted' | 'rejected' | 'pending' = 'pending';
          if (order.statuses_id === 1) status = 'accepted';
          else if (order.statuses_id === 2) status = 'rejected';
          else if (order.statuses_id === 3) status = 'pending';

          return {
            direction: 'up' as const,
            title: `${order.product_variation?.product?.name || 'Product'} | ${order.product_variation?.name || 'Variation'}`,
            date: order.created_at,
            status: 'Purchased',
            value: `$${parseFloat(order.total_price).toFixed(2)}`,
            originalStatus: status
          };
        });

      const processedPayments = (paymentsResponse.credits || [])
        .filter((payment: any) => payment.statuses_id === 1)
        .map((payment: any) => {
          let status: 'accepted' | 'rejected' | 'pending' = 'pending';
          if (payment.statuses_id === 1) status = 'accepted';
          else if (payment.statuses_id === 2) status = 'rejected';
          else if (payment.statuses_id === 3) status = 'pending';

          return {
            direction: 'down' as const,
            title: `${payment.credits_types?.title || 'Payment'} | ${payment.amount} $`,
            date: payment.created_at,
            status: 'Received',
            value: `${payment.amount} $`,
            originalStatus: status
          };
        });

      setOrders(processedOrders);
      setPayments(processedPayments);
      setHasError(false);
      hasDataRef.current = true; // Mark data as fetched
    } catch (error) {
      console.error('Error fetching orders and payments:', error);
      setHasError(true);

      // Check if it's a rate limiting error
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('Too Many Attempts') || errorMessage.includes('429')) {
          console.warn('Rate limit exceeded, will retry later');
          // Set a longer delay before allowing retry
          setTimeout(() => {
            setHasError(false);
          }, 30000); // 30 seconds delay
          return;
        }
      }

      // Fallback to user session data if available
      if (profileData?.orders) {
        const processedOrders = profileData.orders
          .filter((order: any) => order.statuses_id === 1)
          .map((order: any) => ({
            direction: 'up' as const,
            title: `${order.product_variation?.product?.name || 'Product'} | ${order.product_variation?.name || 'Variation'}`,
            date: order.created_at,
            status: 'Purchased',
            value: `$${parseFloat(order.total_price).toFixed(2)}`,
            originalStatus: 'accepted'
          }));
        setOrders(processedOrders);
        hasDataRef.current = true; // Mark data as fetched
      }
      if (!profileData?.orders) {
        setOrders([]);
      }
      setPayments([]);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [router.locale]); // Removed user dependency to prevent excessive re-renders

  // Initial data fetch on mount - only once per profile session
  useEffect(() => {
    if (profileData && profileData.id && !hasInitialized) {
      setHasInitialized(true);
      // Add a small delay to ensure profile data is fully loaded
      setTimeout(() => {
        fetchOrdersAndPayments();
      }, 100);
    }
  }, [profileData, hasInitialized, fetchOrdersAndPayments]);

  const handleDateChange = (from: string, to: string) => {
    // No API call needed for date filtering - just update local state
    if (!from && !to) {
      setDateFilter(null);
    } else {
      setDateFilter({ from, to });
    }
    setDisplayedItemsCount(ITEMS_PER_PAGE);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setHasError(false);
    setDisplayedItemsCount(ITEMS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setDisplayedItemsCount(prev => prev + ITEMS_PER_PAGE);
      setIsLoadingMore(false);
    }, 500);
  };

  const filteredItems = useMemo(() => {
    let items = [];
    if (activeFilter === 'all') {
      items = [...orders, ...payments];
    } else if (activeFilter === 'purchased') {
      items = orders;
    } else if (activeFilter === 'received') {
      items = payments;
    }

    // Apply date filter if set
    if (dateFilter && dateFilter.from && dateFilter.to && dateFilter.from !== '' && dateFilter.to !== '') {
      const fromDate = new Date(dateFilter.from);
      fromDate.setHours(0, 0, 0, 0); // Start of day

      const toDate = new Date(dateFilter.to);
      toDate.setHours(23, 59, 59, 999); // End of day

      items = items.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= fromDate && itemDate <= toDate;
      });
    }

    // Sort by date from newest to oldest
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeFilter, orders, payments, dateFilter]);

  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, displayedItemsCount);
  }, [filteredItems, displayedItemsCount]);

  const hasMoreItems = displayedItemsCount < filteredItems.length;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 md:gap-14">
        <div className="w-fit mb-2">
          <BackButton href="/" label={dashboardSettings?.dashboard_page_settings.homepage_button_label} />
        </div>
        {/* Content */}
        <>
          {/* Profile Error Display */}
          {profileError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 dark:text-red-400 font-medium">{profileError}</span>
              </div>
            </div>
          )}

          {/* Page Title & User Info */}
          <div className="flex flex-col items-start gap-1 relative">
            {/* Loading overlay for profile section */}

            <div className="flex flex-row items-center gap-2 flex-wrap">
              <span className="uppercase font-roboto font-semibold text-2xl md:text-[36px] leading-tight text-[#E73828] tracking-tight">
                {profileData?.username}
              </span>
            </div>
            {/* Hide badge if user is not a business */}
            {
              (profileData?.user_types?.slug) && (
                <div className="flex flex-row items-center gap-2">
                  {/* VIP badge */}
                  <span className="flex flex-row justify-center items-center border border-[#E73828] rounded-[20px] px-2 py-1 gap-1">
                    <span className="font-nunito font-medium text-[12px] leading-[16px] text-black dark:text-white">
                      {profileData?.user_types?.slug || ''}
                    </span>
                    <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.02494 2.01245C2.95107 2.01249 2.87857 2.03237 2.815 2.07C2.75144 2.10764 2.69915 2.16165 2.66359 2.2264L1.15109 4.9764C1.11123 5.04894 1.09411 5.13178 1.10196 5.21418C1.1098 5.29657 1.14225 5.3747 1.19509 5.4384L5.18259 10.2509C5.2213 10.2976 5.26983 10.3352 5.32473 10.361C5.37963 10.3868 5.43955 10.4002 5.50021 10.4002C5.56088 10.4002 5.6208 10.3868 5.6757 10.361C5.7306 10.3352 5.77913 10.2976 5.81784 10.2509L9.80534 5.4384C9.85818 5.3747 9.89063 5.29657 9.89847 5.21418C9.90632 5.13178 9.8892 5.04894 9.84934 4.9764L8.33684 2.2264C8.30124 2.16157 8.24886 2.1075 8.18519 2.06986C8.12152 2.03222 8.0489 2.01239 7.97494 2.01245H3.02494ZM2.28574 4.62495L3.26859 2.83745H4.09359L3.46769 4.62495H2.28574ZM3.37914 5.44995L4.44009 8.06135L2.27584 5.44995H3.37914ZM5.49389 8.4645L4.26959 5.44995H6.68189L5.49389 8.4645ZM4.34219 4.62495L4.96754 2.83745H6.03729L6.69564 4.62495H4.34219ZM7.57509 4.62495L6.91674 2.83745H7.73074L8.71414 4.62495H7.57509ZM7.56849 5.44995H8.72349L6.52074 8.10865L7.56849 5.44995Z" fill="#E73828" />
                    </svg>
                  </span>
                  <span className="font-nunito font-medium text-base md:text-[16px] leading-[22px] text-[#070707] dark:text-white">
                    {profileData?.user_types?.title || 'Wholesale Account'}
                  </span>
                </div>
              )
            }
          </div>

          {/* Summary Cards */}
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            {/* Your Balance */}
            <div className="flex flex-col justify-center items-start p-4 md:p-[21px_16px] gap-[10px] w-full h-[104px] bg-[rgba(7,7,7,0.1)] dark:bg-[rgba(255,255,255,0.1)] rounded-[10px] overflow-hidden">
              <div className="flex flex-col items-start p-0 gap-2 w-full">
                <span className="font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707] dark:text-white">
                  {dashboardSettings?.dashboard_page_settings.balance_label}
                </span>
                <span className="font-['Roboto'] font-semibold text-xl md:text-2xl leading-[28px] text-[#5FD568]">
                  {isLoadingProfile ? (
                    <span className="animate-pulse">{locale === 'en' ? 'Loading...' : 'جاري التحميل...'}</span>
                  ) : (
                    `${profileData?.credits_balance || 0} $`
                  )}
                </span>
              </div>
            </div>

            {/* Total Purchases */}
            <div className="flex flex-col justify-center items-start p-4 md:p-[21px_16px] gap-[10px] w-full h-[104px] bg-[rgba(7,7,7,0.1)] dark:bg-[rgba(255,255,255,0.1)] rounded-[10px] overflow-hidden">
              <div className="flex flex-col items-start p-0 gap-2 w-full">
                <span className="font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707] dark:text-white">
                  {dashboardSettings?.dashboard_page_settings.total_purchases_label}
                </span>
                <span className="font-['Roboto'] font-semibold text-xl md:text-2xl leading-[28px] text-[#E73828]">
                  {isLoadingProfile ? (
                    <span className="animate-pulse">{locale === 'en' ? 'Loading...' : 'جاري التحميل...'}</span>
                  ) : (
                    `${profileData?.total_purchases || 0} $`
                  )}
                </span>
              </div>
            </div>

            {/* Received */}
            <div className="flex flex-col justify-center items-start p-4 md:p-[21px_16px] gap-[10px] w-full h-[104px] bg-[rgba(7,7,7,0.1)] dark:bg-[rgba(255,255,255,0.1)] rounded-[10px] overflow-hidden">
              <div className="flex flex-col items-start p-0 gap-2 w-full">
                <span className="font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707] dark:text-white">
                  {dashboardSettings?.dashboard_page_settings.received_amount_label}
                </span>
                <span className="font-['Roboto'] font-semibold text-xl md:text-2xl leading-[28px] text-[#5FD568]">
                  {isLoadingProfile ? (
                    <span className="animate-pulse">{locale === 'en' ? 'Loading...' : 'جاري التحميل...'}</span>
                  ) : (
                    `${profileData?.received_amount || 0} $`
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Filter */}
          <div className="flex flex-col gap-2">
            <TransactionFilter
              onDateChange={handleDateChange}
              onFilterChange={handleFilterChange}
              fromLabel={dashboardSettings?.dashboard_page_settings.from_label}
              toLabel={dashboardSettings?.dashboard_page_settings.to_label}
              searchButton={dashboardSettings?.dashboard_page_settings.search_button}
              allTransfersLabel={dashboardSettings?.dashboard_page_settings.all_transfers_label}
              receivedFilterLabel={dashboardSettings?.dashboard_page_settings.received_filter_label}
              purchasedFilterLabel={dashboardSettings?.dashboard_page_settings.purchased_filter_label}
            />
            {dateFilter && dateFilter.from && dateFilter.to && (
              <div className="flex items-center gap-2 text-sm text-[#8E8E8E] dark:text-[#fff]">
                <span>{locale === 'en' ? 'Filtered by Date:' : 'تمت عملية التصفية بالتاريخ:'} {new Date(dateFilter.from).toLocaleDateString()} - {new Date(dateFilter.to).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Orders and Payments List */}
          <div className="flex flex-col items-start p-0 gap-2 max-w-full w-full">
            {isLoading ? (
              <div className="w-full flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E73828]"></div>
              </div>
            ) : hasError ? (
              <div className="w-full flex flex-col justify-center items-center py-8 gap-4">
                <span className="font-['Roboto'] font-normal text-base text-[#E73828] dark:text-[#ff6b6b] text-center">
                  {
                    locale === 'en' ? 'Failed to load transactions. Please try again.' : 'فشلت عملية التحميل. يرجى المحاولة مرة أخرى.'
                  }
                </span>
                <button
                  onClick={() => {
                    setHasError(false);
                    fetchOrdersAndPayments(); // Retry without force refresh
                  }}
                  disabled={isFetching}
                  className="px-6 py-3 bg-[#E73828] hover:bg-[#d63224] disabled:bg-[#E73828]/50 text-white font-['Roboto'] font-medium text-base rounded-[25px] transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {isFetching ? locale === 'en' ? 'Loading...' : 'جاري التحميل...' : locale === 'en' ? 'Retry' : 'إعادة المحاولة'}
                </button>
                <p className="text-sm text-[#8E8E8E] dark:text-[#a0a0a0] text-center max-w-md">
                  {
                    locale === 'en' ? 'If you see "Too Many Attempts" error, please wait a few minutes before retrying.' : 'إذا رأيت خطأ "Too Many Attempts", يرجى الإنتظار بضع دقائق قبل المحاولة مرة أخرى.'
                  }
                </p>
              </div>
            ) : (
              <>
                {filteredItems.length === 0 && (
                  <div className="w-full flex justify-center items-center py-8">
                    <span className="font-['Roboto'] font-normal text-base text-[#8E8E8E] dark:text-[#a0a0a0]">
                      {
                        locale === 'en' ? 'No transactions found' : 'لا يوجد تحويلات'
                      }
                    </span>
                  </div>
                )}
                {displayedItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-row justify-between items-center p-3 gap-2 w-full max-w-full h-[66px] bg-[rgba(7,7,7,0.05)] dark:bg-[rgba(255,255,255,0.05)] rounded-[20px] md:rounded-[50.5px] overflow-x-auto"
                  >
                    {/* Left Section - Icon, Title, Date */}
                    <div className="flex flex-row items-center p-0 gap-4 min-w-0 flex-1">
                      {/* Icon Circle */}
                      <div className="relative w-9 h-9 flex-shrink-0">
                        <div className={`absolute w-9 h-9 rounded-full ${item.direction === 'up' ? 'bg-[#E73828]' : 'bg-[#5FD568]'}`}></div>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          className={`absolute left-[6px] top-[6px] ${item.direction === 'down' ? 'transform rotate-180' : ''}`}
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
                      <div className="flex flex-col justify-center items-start p-0 gap-1 min-w-0">
                        <div className="flex flex-row items-center p-0 gap-1 w-full">
                          <span className="font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] dark:text-white truncate">
                            {item.title.split(' | ')[0]}
                          </span>
                          {item.title.includes(' | ') && (
                            <>
                              <span className="w-[1px] h-3 bg-[#E73828] flex-shrink-0"></span>
                              <span className="font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] dark:text-white truncate">
                                {item.title.split(' | ')[1]}
                              </span>
                            </>
                          )}
                        </div>
                        <span className="font-['Roboto'] font-normal text-xs leading-[14px] text-[#8E8E8E] dark:text-[#a0a0a0]">
                          {formatDate(item.date)}
                        </span>
                      </div>
                    </div>
                    {/* Right Section - Status and Prices */}
                    <div className="flex flex-row justify-end items-center gap-2 flex-shrink-0">
                      {/* <span className="font-['Roboto'] font-normal text-sm leading-[16px] text-[#8E8E8E] dark:text-[#a0a0a0] text-right">
                          {item.status}
                        </span> */}
                      <span className={`font-['Roboto'] font-normal text-base leading-[19px] ${item.direction === 'up' ? 'text-[#E73828]' : 'text-[#5FD568]'} text-right`}>
                        {item.value}
                      </span>
                    </div>
                  </motion.div>
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
                          <span>{locale === 'en' ? 'Loading...' : 'جاري التحميل...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{locale === 'en' ? 'Load More' : 'تحميل المزيد'}</span>
                          <span className="text-sm opacity-75">
                            ({filteredItems.length - displayedItemsCount} {locale === 'en' ? 'more' : 'أكثر'})
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>

      </div>

      {/* WhatsApp Floating Button */}
      {/* <WhatsAppButton style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 50 }} /> */}
    </DashboardLayout>
  );
}