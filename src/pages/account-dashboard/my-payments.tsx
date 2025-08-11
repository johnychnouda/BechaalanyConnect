import DashboardLayout from "@/components/ui/dashboard-layout";
import React, { useState, useEffect, useMemo } from "react";
import BackButton from "@/components/ui/back-button";
import { fetchUserPayments } from "@/services/api.service";
import { useAuth } from "@/context/AuthContext";
import PaymentRow from "./paymentRow";

const ITEMS_PER_PAGE = 5; // Number of items to show initially and per load more

export default function MyPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Array<{
    id: number;
    status: 'accepted' | 'rejected' | 'pending';
    title: string;
    value: string;
    date: string;
    screenshot: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [displayedItemsCount, setDisplayedItemsCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchUserPayments();
        // Map API response to PaymentRow props
        const mappedPayments = (response.credits || []).map((item: any) => {
          let status: 'accepted' | 'rejected' | 'pending' = 'pending';
          if (item.statuses_id === 1) status = 'accepted';
          else if (item.statuses_id === 2) status = 'rejected';
          else if (item.statuses_id === 3) status = 'pending';
          return {
            id: item.id,
            status,
            title: `${item.credits_types.title} | ${item.amount} $`,
            value: item.amount + '$',
            date: item.created_at,
            screenshot: item.full_path?.receipt_image || null,
          };
        });
        setPayments(mappedPayments);
      } catch (err) {
        setError('Failed to load payments.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filterButtons = [
    {
      key: "all",
      label: "All Payments",
      className: activeFilter === "all"
        ? "bg-[#F3F3F3] border border-[#E0E0E0] text-[#070707]"
        : "bg-white border border-[#E0E0E0] text-[#070707]",
      icon: null,
    },
    {
      key: "accepted",
      label: "Accepted",
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
      label: "Rejected",
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
      label: "Pending",
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

  // Filter payments based on activeFilter
  const filteredPayments = activeFilter === "all"
    ? payments
    : payments.filter(p => p.status === activeFilter);

  const displayedPayments = useMemo(() => {
    return filteredPayments.slice(0, displayedItemsCount);
  }, [filteredPayments, displayedItemsCount]);

  const hasMoreItems = displayedItemsCount < filteredPayments.length;

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setDisplayedItemsCount(ITEMS_PER_PAGE); // Reset to initial count when filter changes
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setDisplayedItemsCount(prev => prev + ITEMS_PER_PAGE);
      setIsLoadingMore(false);
    }, 500);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="w-fit">
          <BackButton href="/account-dashboard" />
        </div>
        <div className="text-[#E73828] text-[36px] font-semibold font-['Roboto'] leading-[42px] uppercase mb-8 mt-0 tracking-tight">MY PAYMENTS</div>
        <div className="flex flex-col items-start w-full pb-6 gap-[25px] border-b border-[rgba(0,0,0,0.1)] mb-8" style={{ boxSizing: 'border-box' }}>
          <div className="flex flex-row gap-2 w-full overflow-x-auto whitespace-nowrap" style={{ height: '35px' }}>
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
        </div>
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E73828]"></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payments found.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 w-full">
              {displayedPayments.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  expanded={expandedId === payment.id}
                  onToggle={() => setExpandedId(expandedId === payment.id ? null : payment.id)}
                />
              ))}
            </div>

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
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More</span>
                      <span className="text-sm opacity-75">
                        ({filteredPayments.length - displayedItemsCount} more)
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Empty state */}
            {!hasMoreItems && filteredPayments.length > 0 && (
              <div className="w-full flex justify-center items-center py-4">
                <span className="font-['Roboto'] font-normal text-sm text-[#8E8E8E] dark:text-[#a0a0a0]">
                  No more payments to load
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
