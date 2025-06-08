import React from 'react';
import { DashboardFilterButtonGroup } from '@/components/ui/dashboard-filter-buttons';
import DateRangeFilter from '@/components/ui/date-range-filter';

interface TransactionFilterProps {
  onDateChange?: (from: string, to: string) => void;
  onFilterChange?: (filter: string) => void;
}

const TransactionFilter: React.FC<TransactionFilterProps> = ({
  onDateChange,
  onFilterChange,
}) => {
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('all');

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  return (
    <div className="box-border flex flex-col items-start p-0 pb-6 gap-[25px] w-full max-w-[878px] h-auto border-b border-[rgba(0,0,0,0.1)]">
      <DateRangeFilter
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onDateChange={onDateChange}
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