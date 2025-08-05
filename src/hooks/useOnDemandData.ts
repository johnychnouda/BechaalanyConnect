import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useOnDemandData = () => {
  const { user, refreshUserData } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const isRefreshingRef = useRef(false);

  const refreshData = useCallback(async () => {
    if (isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    try {
      await refreshUserData();
      setLastFetched(new Date());
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [refreshUserData]);

  return {
    user,
    isRefreshing,
    refreshData,
    lastFetched,
    timeSinceLastFetch: lastFetched ? Date.now() - lastFetched.getTime() : null,
  };
}; 