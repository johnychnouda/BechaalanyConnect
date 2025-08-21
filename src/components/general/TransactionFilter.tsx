import React from 'react';
import { DashboardFilterButtonGroup } from '@/components/ui/dashboard-filter-buttons';
import DateRangeFilter from '@/components/ui/date-range-filter';

interface TransactionFilterProps {
  onDateChange?: (from: string, to: string) => void;
  onFilterChange?: (filter: string) => void;
}

const formatDateToString = (date: Date | null): string => {
  if (!date) return '';
  // Use the local timezone and pad with leading zeros
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TransactionFilter: React.FC<TransactionFilterProps> = ({
  onDateChange,
  onFilterChange,
}) => {
  const [fromDate, setFromDate] = React.useState<Date | null>(null);
  const [toDate, setToDate] = React.useState<Date | null>(null);
  const [activeFilter, setActiveFilter] = React.useState('all');

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  const handleDateChange = (from: Date | null, to: Date | null) => {
    if (onDateChange) {
      onDateChange(formatDateToString(from), formatDateToString(to));
    }
  };

  return (
    <div className="box-border flex flex-col items-start p-0 pb-6 gap-[25px] w-full max-w-[878px] h-auto border-b border-[rgba(0,0,0,0.1)]">
      <DateRangeFilter
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onDateChange={handleDateChange}
      />
      <div className="flex flex-row items-start p-0 gap-4 w-full h-[35px] overflow-x-auto whitespace-nowrap min-w-0">
        <DashboardFilterButtonGroup
          activeFilter={activeFilter}
          onFilterChange={handleFilterClick}
        />
      </div>
    </div>
  );
};

export default TransactionFilter; 