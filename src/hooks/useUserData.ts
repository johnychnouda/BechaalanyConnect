import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useUserData = (autoRefresh = false, refreshInterval = 60000) => {
  const { user, refreshUserData } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);

  const refreshUserDataWithLoading = useCallback(async () => {
    if (isRefreshing) return; // Prevent concurrent refreshes
    
    setIsRefreshing(true);
    try {
      await refreshUserData();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshUserData, isRefreshing]);

  // Initial refresh when user becomes available
  useEffect(() => {
    if (user && !hasInitialized.current) {
      hasInitialized.current = true;
      refreshUserDataWithLoading();
    }
  }, [user, refreshUserDataWithLoading]);

  // Auto-refresh with interval (only if autoRefresh is true)
  useEffect(() => {
    if (autoRefresh && user) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Set up new interval
      intervalRef.current = setInterval(() => {
        refreshUserDataWithLoading();
      }, refreshInterval);

      // Cleanup on unmount or when dependencies change
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [autoRefresh, user, refreshUserDataWithLoading, refreshInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    user,
    isRefreshing,
    refreshUserData: refreshUserDataWithLoading,
  };
}; 