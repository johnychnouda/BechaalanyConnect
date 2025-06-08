import React from 'react';
import { DashboardFilterButtonGroup } from '@/components/ui/dashboard-filter-buttons';

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

  const handleSearch = () => {
    onDateChange?.(fromDate, toDate);
  };

  return (
    <div className="box-border flex flex-col items-start p-0 pb-6 gap-[25px] w-full max-w-[878px] h-auto border-b border-[rgba(0,0,0,0.1)]">
      {/* Date Filter Section */}
      <div className="flex flex-col gap-4 w-full md:flex-row md:items-end md:gap-[25px] md:h-[66px]">
        {/* From Date */}
        <div className="flex flex-col items-start p-0 gap-1 w-full md:w-[377px] md:h-[66px]">
          <span className="w-full md:w-[377px] h-[19px] font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707] dark:text-white">
            From
          </span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="box-border flex flex-row items-center p-3 px-6 gap-[10px] w-full md:w-[377px] h-[43px] border border-[#070707] dark:border-[#E73828] rounded-[50.5px] font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] dark:text-white bg-white dark:bg-[#2a2a2a]"
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col items-start p-0 gap-1 w-full md:w-[377px] md:h-[66px]">
          <span className="w-full md:w-[377px] h-[19px] font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707] dark:text-white">
            Till
          </span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="box-border flex flex-row items-center p-3 px-6 gap-[10px] w-full md:w-[377px] h-[43px] border border-[#070707] dark:border-[#E73828] rounded-[50.5px] font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] dark:text-white bg-white dark:bg-[#2a2a2a]"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="flex flex-row justify-center items-center p-2 px-6 gap-[10px] w-full md:w-[74px] h-[43px] bg-[#E73828] rounded-[50.5px] font-['Roboto'] font-bold text-xs leading-[14px] uppercase text-white border border-[#E73828] transition-colors duration-200 hover:bg-white hover:text-[#E73828] hover:border-[#E73828] focus:outline-none focus:ring-2 focus:ring-[#E73828]"
        >
          Search
        </button>
      </div>

      {/* Transaction Type Filters */}
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