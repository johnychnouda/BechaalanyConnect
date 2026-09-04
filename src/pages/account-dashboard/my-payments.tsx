import DashboardLayout from "@/components/ui/dashboard-layout";
import React, { useState, useEffect, useMemo } from "react";
import BackButton from "@/components/ui/back-button";
import { fetchUserPayments } from "@/services/api.service";
import { useAuth } from "@/context/AuthContext";
import PaymentRow from "@/components/dashboard/paymentRow";
import { useRouter } from "next/router";
import { useGlobalContext } from "@/context/GlobalContext";
import { useLanguage } from "@/hooks/use-language";
import { toMessage, toNumber } from "@/utils/error-message";
import { EmptyState } from "@/components/ui/primitives/EmptyState";
import { ErrorState } from "@/components/ui/primitives/ErrorState";
import { SkeletonRow } from "@/components/ui/primitives/Skeleton";

const ITEMS_PER_PAGE = 5; // Number of items to show initially and per load more

export default function MyPayments() {
  const { user } = useAuth();
  const router = useRouter();
  const { dashboardSettings, generalData } = useGlobalContext();
  const { locale } = useLanguage();
  const [payments, setPayments] = useState<Array<{
    id: number;
    status: 'accepted' | 'rejected' | 'pending';
    title: string;
    value: string;
    date: string;
    screenshot: string | null;
    rejected_reason: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  /**
   * Fetch one page of top-ups.
   *
   * Same defect as My Orders: this requested page 1 only (10 rows) and "Load More"
   * re-sliced that array, so older top-ups were unreachable.
   */
  const fetchPayments = async (requestedPage = 1) => {
    if (requestedPage === 1) setLoading(true);
    else setIsLoadingMore(true);
    setError(null);

    try {
      const response = await fetchUserPayments(router.locale, requestedPage, ITEMS_PER_PAGE);

      const mappedPayments = (response.credits || []).map((item: any) => {
        let status: 'accepted' | 'rejected' | 'pending' = 'pending';
        if (item.statuses_id === 1) status = 'accepted';
        else if (item.statuses_id === 2) status = 'rejected';
        else if (item.statuses_id === 3) status = 'pending';
        return {
          id: item.id,
          status,
          // credits_types can be null if the type was removed; this used to crash
          // the whole page with "cannot read property title of null".
          title: `${item.credits_types?.title ?? ''}`,
          // amount arrives as a decimal string now that the column is DECIMAL.
          value: `$${toNumber(item.amount).toFixed(2)}`,
          date: item.created_at,
          screenshot: item.full_path?.receipt_image || null,
          rejected_reason: item.rejected_reason || null,
        };
      });

      setPayments((previous) =>
        requestedPage === 1 ? mappedPayments : [...previous, ...mappedPayments]
      );
      setPage(response.current_page || requestedPage);
      setLastPage(response.last_page || 1);
    } catch (err) {
      // Reachable now: fetchUserPayments used to return an empty list on failure, so
      // an outage rendered "No payments found."
      setError(toMessage(err, router.locale));
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Depends on the locale: credit-type titles are translated server-side.
  useEffect(() => {
    setPage(1);
    fetchPayments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.locale]);

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
        <span className="absolute start-[12px] flex items-center justify-center" style={{ width: '19px', height: '19px', top: '50%', transform: 'translateY(-50%)' }}>
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
        ? "bg-app-red border border-app-red text-white"
        : "bg-white border border-app-red text-app-red",
      icon: (
        <span className="absolute start-[12px] flex items-center justify-center" style={{ width: '19px', height: '19px', top: '50%', transform: 'translateY(-50%)' }}>
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
        <span className="absolute start-[12px] flex items-center justify-center" style={{ width: '19px', height: '19px', top: '50%', transform: 'translateY(-50%)' }}>
          <span style={{ background: '#FF9D00', borderRadius: '50%', width: '19px', height: '19px', display: 'block', position: 'absolute', left: 0, top: 0 }}></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" style={{ position: 'absolute', left: '3.17px', top: '3.17px' }}>
            <rect x="5.5" y="3" width="1.67" height="5.5" rx="0.8" fill="white" />
            <rect x="5.5" y="9.2" width="1.67" height="1.67" rx="0.8" fill="white" />
          </svg>
        </span>
      ),
    },
  ];

  // Filter payments based on activeFilter
  const filteredPayments = activeFilter === "all"
    ? payments
    : payments.filter(p => p.status === activeFilter);

  // Everything fetched so far is shown; paging comes from the API.
  const displayedPayments = filteredPayments;

  const hasMoreItems = page < lastPage;

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMoreItems) return;
    fetchPayments(page + 1);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="w-fit">
          <BackButton label={generalData?.settings?.back_button_label} />
        </div>
        <div className="text-app-red text-[36px] font-semibold leading-[42px] uppercase mb-8 mt-0 tracking-tight">{dashboardSettings?.dashboard_page_settings?.my_payments_page_title}</div>
        <div className="flex flex-col items-start w-full pb-6 gap-[25px] border-b border-[rgba(0,0,0,0.1)] mb-8" style={{ boxSizing: 'border-box' }}>
          <div className="flex flex-row gap-2 w-full overflow-x-auto whitespace-nowrap" style={{ height: '35px' }}>
            {filterButtons.map(btn => (
              <button
                key={btn.key}
                className={`flex items-center rounded-[50.5px] px-3 py-2 font-semibold text-[15px] h-[35px] ${btn.className}`}
                style={{ minWidth: '140px', maxWidth: '160px' }}
                onClick={() => handleFilterChange(btn.key)}
                type="button"
              >
                {btn.icon && (
                  <span className="flex items-center justify-center me-3" style={{ width: 19, height: 19, position: 'relative' }}>
                    {btn.icon}
                  </span>
                )}
                <span className="flex-1 text-center truncate">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Error Message */}
        {error && !loading && (
          <ErrorState
            message={error}
            onRetry={() => router.reload()}
            retryLabel={locale === 'en' ? 'Try again' : 'إعادة المحاولة'}
          />
        )}
        {loading ? (
          <div className="flex flex-col gap-4 w-full">
            {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : error ? null : filteredPayments.length === 0 ? (
          <EmptyState
            title={locale === 'en' ? 'No payments found.' : 'لا يوجد دفعات مضافة'}
            action={{
              label: locale === 'en' ? 'Add credits' : 'إضافة رصيد',
              href: '/account-dashboard/add-credits',
            }}
          />
        ) : (
          <>
            <div className="flex flex-col gap-4 w-full">
              {displayedPayments.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  expanded={expandedId === payment.id}
                  onToggle={() => setExpandedId(expandedId === payment.id ? null : payment.id)}
                  locale={locale}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreItems && (
              <div className="w-full flex justify-center items-center py-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-app-red hover:bg-app-red-hover disabled:bg-app-red/50 text-white font-medium text-base rounded-[25px] transition-all duration-200 disabled:cursor-not-allowed"
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

            {/* Empty state */}
            {/* Only when there genuinely is more than one page. */}
            {!hasMoreItems && lastPage > 1 && (
              <div className="w-full flex justify-center items-center py-4">
                <span className="font-normal text-sm text-[#8E8E8E] dark:text-[#a0a0a0]">
                  {locale === 'en' ? 'No more payments to load' : 'لا يوجد دفعات مضافة أخرى'}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
