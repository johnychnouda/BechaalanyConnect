import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useTransactions = () => {
  const { user, refreshUserData } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshUserDataWithLoading = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshUserData();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshUserData]);

  return {
    user,
    isRefreshing,
    refreshUserData: refreshUserDataWithLoading,
  };
}; 