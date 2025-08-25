import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface CacheEntry {
  balance: number;
  timestamp: number;
  pendingRequests: string[];
}

/**
 * Smart caching hook that minimizes API calls while keeping data fresh
 * Invalidates cache on specific events
 */
export const useSmartCreditsCache = () => {
  const { user, refreshUserData } = useAuth();
  const [cache, setCache] = useState<CacheEntry | null>(null);
  const [isStale, setIsStale] = useState(false);

  // Cache duration: 2 minutes for normal operations
  const CACHE_DURATION = 2 * 60 * 1000;
  
  // Events that should invalidate cache immediately
  const invalidateCache = useCallback(() => {
    setCache(null);
    setIsStale(true);
    // Trigger immediate refresh
    refreshUserData(true);
  }, [refreshUserData]);

  // Smart refresh based on user activity
  const smartRefresh = useCallback(() => {
    if (!cache) return;
    
    const now = Date.now();
    const timeSinceCache = now - cache.timestamp;
    
    // If cache is older than duration, mark as stale
    if (timeSinceCache > CACHE_DURATION) {
      setIsStale(true);
      refreshUserData(false);
    }
  }, [cache, refreshUserData]);

  // Update cache when user data changes
  useEffect(() => {
    if (user?.credits_balance !== undefined) {
      setCache({
        balance: user.credits_balance,
        timestamp: Date.now(),
        pendingRequests: [],
      });
      setIsStale(false);
    }
  }, [user?.credits_balance]);

  // Set up smart refresh interval
  useEffect(() => {
    const interval = setInterval(smartRefresh, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [smartRefresh]);

  return {
    balance: cache?.balance || 0,
    isStale,
    invalidateCache,
    smartRefresh,
  };
};
