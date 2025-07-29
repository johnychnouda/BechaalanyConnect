import DashboardLayout from "@/components/ui/dashboard-layout";
import React, { useState, useMemo, useEffect } from "react";
import BackButton from "@/components/ui/back-button";
import { Order, useAuth } from "@/context/AuthContext";
import { ProcessedOrder } from "./orderRow";
import OrderRow from "./orderRow";
import { fetchUserOrders } from "@/services/api.service";
import { useGlobalContext } from "@/context/GlobalContext";

export default function MyOrders() {
  const { user } = useAuth();
  const { setRefreshOrdersCallback } = useGlobalContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  
  // Fetch orders from API
  const fetchOrders = async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) {
        setAutoRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await fetchUserOrders();

      console.log("response", response);
      
      // If API returns empty orders and we have session orders, use session orders
      if ((!response.orders || response.orders.length === 0) && user?.orders && Array.isArray(user.orders) && user.orders.length > 0) {
        setOrders(user.orders);
        if (!isAutoRefresh) {
          setError('Using cached orders. Some orders may not be up to date.');
        }
      } else {
        setOrders(response.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Using cached data.');
      // Fallback to session orders if API fails
      if (user?.orders && Array.isArray(user.orders)) {
        setOrders(user.orders);
      }
    } finally {
      setLoading(false);
      setAutoRefreshing(false);
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Register refresh function with global context
  useEffect(() => {
    setRefreshOrdersCallback(() => fetchOrders);
  }, [setRefreshOrdersCallback]);

  // Auto-refresh orders every 30 seconds when user is on the page
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 180000); //3min

    return () => clearInterval(interval);
  }, []);

  // Process orders from API data
  const processedOrders: ProcessedOrder[] = useMemo(() => {
    if (!orders || !Array.isArray(orders)) {
      return [];
    }

    return orders.map((order: Order) => {
      // Map statuses_id to status string
      let status: 'accepted' | 'rejected' | 'pending' = 'pending';
      if (order.statuses_id === 1) status = 'accepted';
      else if (order.statuses_id === 2) status = 'rejected';
      else if (order.statuses_id === 3) status = 'pending';

      // Create title based on product variation (you might need to fetch product details)
      const title = `${order.product_variation.name}`;
      
      // Format price
      const value = `$${parseFloat(order.total_price).toFixed(2)}`;
      
      // Create recipient info
      let recipient_info = '';
      if (order.recipient_user) {
        recipient_info = `User ID: ${order.recipient_user}`;
      } else if (order.recipient_phone_number) {
        recipient_info = `Phone: ${order.recipient_phone_number}`;
      }

      return {
        id: order.id,
        status,
        title,
        value,
        date: order.created_at,
        quantity: order.quantity,
        recipient_info
      };
    });
  }, [orders]);

  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filterButtons = [
    {
      key: "all",
      label: "All Orders",
      className:
        activeFilter === "all"
          ? "bg-[#F3F3F3] border border-[#E0E0E0] text-[#070707] w-[160px]"
          : "bg-white border border-[#E0E0E0] text-[#070707] w-[160px]",
      icon: null,
    },
    {
      key: "accepted",
      label: "Accepted",
      className:
        activeFilter === "accepted"
          ? "bg-[#5FD568] border border-[#5FD568] text-white w-[140px]"
          : "bg-white border border-[#5FD568] text-[#5FD568] w-[140px]",
      icon: (
        <div className="relative w-[19px] h-[19px]">
          <span className="absolute inset-0 bg-[#5FD568] rounded-full"></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" className="absolute left-[3.17px] top-[3.17px]">
            <path d="M3.5 7.5L6 10L10 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ),
    },
    {
      key: "rejected",
      label: "Rejected",
      className:
        activeFilter === "rejected"
          ? "bg-[#E73828] border border-[#E73828] text-white w-[140px]"
          : "bg-white border border-[#E73828] text-[#E73828] w-[140px]",
      icon: (
        <div className="relative w-[19px] h-[19px]">
          <span className="absolute inset-0 bg-[#E73828] rounded-full"></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" className="absolute left-[3.17px] top-[3.17px]">
            <rect x="3" y="5.5" width="7" height="1.67" rx="0.8" fill="white" transform="rotate(45 6.335 6.335)" />
            <rect x="3" y="5.5" width="7" height="1.67" rx="0.8" fill="white" transform="rotate(-45 6.335 6.335)" />
          </svg>
        </div>
      ),
    },
    {
      key: "pending",
      label: "Pending",
      className:
        activeFilter === "pending"
          ? "bg-[#FB923C] border border-[#FB923C] text-white w-[140px]"
          : "bg-white border border-[#FB923C] text-[#FB923C] w-[140px]",
      icon: (
        <div className="relative w-[19px] h-[19px]">
          <span className="absolute inset-0 bg-[#FB923C] rounded-full"></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" className="absolute left-[3.17px] top-[3.17px]">
            <rect x="5.5" y="3" width="1.67" height="5.5" rx="0.8" fill="white" />
            <rect x="5.5" y="9.2" width="1.67" height="1.67" rx="0.8" fill="white" />
          </svg>
        </div>
      ),
    },
  ];

  const filteredOrders = activeFilter === "all" ? processedOrders : processedOrders.filter((o: ProcessedOrder) => o.status === activeFilter);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-0 md:gap-0">
        <div className="w-fit mb-6 md:mb-8">
          <BackButton href="/account-dashboard" />
        </div>
        <div className="text-[#E73828] text-[36px] font-semibold font-['Roboto'] leading-[42px] uppercase mt-0 tracking-tight">MY ORDERS</div>
      </div>
      <div className="flex flex-col items-start w-full pb-1 md:pb-2 gap-[6px] md:gap-[10px] border-b border-[rgba(0,0,0,0.1)] mb-2 md:mb-3" style={{ boxSizing: 'border-box' }}>
        <div className="flex flex-row gap-1 md:gap-2 lg:gap-4 items-center w-full min-w-0 overflow-x-auto" style={{ minHeight: '35px' }}>
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              className={`flex-1 min-w-[120px] flex flex-row items-center rounded-[50.5px] px-3 md:px-3 py-1 md:py-2 font-['Roboto'] font-semibold text-[16px] h-[32px] md:h-[35px] justify-center relative ${btn.className}`}
              onClick={() => setActiveFilter(btn.key)}
              type="button"
            >
              {btn.icon && (
                <div className="flex items-center justify-center w-[19px] h-[19px] mr-2">
                  {btn.icon}
                </div>
              )}
              <span className="flex-1 text-center">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => fetchOrders()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#E73828] text-white rounded-lg hover:bg-[#d32f2f] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          )}
          Refresh Orders
        </button>
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
          Auto-refreshing orders...
        </div>
      )}

      <div className="flex flex-col gap-4 w-full">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E73828]"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No orders found.
          </div>
        ) : (
          filteredOrders.map((order: ProcessedOrder) => (
            <OrderRow key={order.id} order={order} />
          ))
        )}
      </div>
    </DashboardLayout>
  );
} 