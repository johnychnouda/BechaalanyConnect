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
    <div className="box-border flex flex-col items-start p-0 pb-6 gap-[25px] w-[878px] h-[150px] border-b border-[rgba(0,0,0,0.1)]">
      {/* Date Filter Section */}
      <div className="flex flex-row items-end p-0 gap-[25px] w-[878px] h-[66px]">
        {/* From Date */}
        <div className="flex flex-col items-start p-0 gap-1 w-[377px] h-[66px]">
          <span className="w-[377px] h-[19px] font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707]">
            From
          </span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="box-border flex flex-row items-center p-3 px-6 gap-[10px] w-[377px] h-[43px] border border-[#070707] rounded-[50.5px] font-['Roboto'] font-normal text-base leading-[19px] text-[#070707]"
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col items-start p-0 gap-1 w-[377px] h-[66px]">
          <span className="w-[377px] h-[19px] font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707]">
            Till
          </span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="box-border flex flex-row items-center p-3 px-6 gap-[10px] w-[377px] h-[43px] border border-[#070707] rounded-[50.5px] font-['Roboto'] font-normal text-base leading-[19px] text-[#070707]"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="flex flex-row justify-center items-center p-2 px-6 gap-[10px] w-[74px] h-[43px] bg-[#E73828] rounded-[50.5px] font-['Roboto'] font-bold text-xs leading-[14px] uppercase text-white border border-[#E73828] transition-colors duration-200 hover:bg-white hover:text-[#E73828] hover:border-[#E73828] focus:outline-none focus:ring-2 focus:ring-[#E73828]"
        >
          Search
        </button>
      </div>

      {/* Transaction Type Filters */}
      <DashboardFilterButtonGroup
        activeFilter={activeFilter}
        onFilterChange={handleFilterClick}
      />
    </div>
  );
};

export default TransactionFilter; 