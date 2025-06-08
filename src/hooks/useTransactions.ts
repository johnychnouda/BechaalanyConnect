import { useState, useMemo } from 'react';
import { FILTER_OPTIONS, TRANSACTION_STATUS } from '@/constants/dashboard';

export interface Transaction {
  direction: 'up' | 'down';
  title: string;
  date: string;
  status: typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS];
}

type FilterType = typeof FILTER_OPTIONS[keyof typeof FILTER_OPTIONS];

export const useTransactions = (initialTransactions: Transaction[]) => {
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [activeFilter, setActiveFilter] = useState<FilterType>(FILTER_OPTIONS.ALL);
  const [isLoading, setIsLoading] = useState(false);

  const filteredTransactions = useMemo(() => {
    if (activeFilter === FILTER_OPTIONS.ALL) return transactions;
    return transactions.filter(tx => 
      tx.status.toLowerCase() === activeFilter.toLowerCase()
    );
  }, [transactions, activeFilter]);

  const handleFilterChange = (filter: FilterType) => {
    setIsLoading(true);
    setActiveFilter(filter);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleDateChange = (startDate: string, endDate: string) => {
    setIsLoading(true);
    // Simulate API call with date filter
    setTimeout(() => setIsLoading(false), 500);
  };

  return {
    transactions: filteredTransactions,
    isLoading,
    activeFilter,
    handleFilterChange,
    handleDateChange,
  };
}; 