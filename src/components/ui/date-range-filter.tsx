import React from 'react';

interface DateRangeFilterProps {
  onDateChange?: (from: string, to: string) => void;
  fromDate?: string;
  toDate?: string;
  onFromDateChange?: (date: string) => void;
  onToDateChange?: (date: string) => void;
  onSearch?: () => void;
}

export default function DateRangeFilter({
  onDateChange,
  fromDate = '',
  toDate = '',
  onFromDateChange,
  onToDateChange,
  onSearch
}: DateRangeFilterProps) {
  
  const prevDatesRef = React.useRef({ fromDate: '', toDate: '' });
  
  // Call onDateChange whenever both dates are set and have changed
  React.useEffect(() => {
    const prevDates = prevDatesRef.current;
    const currentDates = { fromDate, toDate };
    
    // Only call onDateChange if both dates are set and have actually changed
    if (onDateChange && fromDate && toDate && 
        (prevDates.fromDate !== fromDate || prevDates.toDate !== toDate)) {
      onDateChange(fromDate, toDate);
      prevDatesRef.current = currentDates;
    }
  }, [fromDate, toDate]); // Removed onDateChange from dependencies to prevent infinite loop

  const handleSearch = () => {
    if (onDateChange && fromDate && toDate) {
      onDateChange(fromDate, toDate);
    }
    onSearch?.();
  };

  return (
    <div className="flex flex-col gap-4 w-full lg:flex-row lg:items-end lg:gap-[25px] lg:h-[66px]">
      <div className="flex flex-col items-start p-0 gap-1 w-full lg:w-[377px] lg:h-[66px]">
        <span className="w-full lg:w-[377px] h-[19px] font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707] dark:text-white">
          From
        </span>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => onFromDateChange?.(e.target.value)}
          className="box-border flex flex-row items-center p-3 px-6 gap-[10px] w-full lg:w-[377px] h-[43px] border border-[#070707] dark:border-[#E73828] rounded-[50.5px] font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] dark:text-white bg-white dark:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#E73828]"
        />
      </div>
      <div className="flex flex-col items-start p-0 gap-1 w-full lg:w-[377px] lg:h-[66px]">
        <span className="w-full lg:w-[377px] h-[19px] font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707] dark:text-white">
          Till
        </span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => onToDateChange?.(e.target.value)}
          className="box-border flex flex-row items-center p-3 px-6 gap-[10px] w-full lg:w-[377px] h-[43px] border border-[#070707] dark:border-[#E73828] rounded-[50.5px] font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] dark:text-white bg-white dark:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#E73828]"
        />
      </div>
      <div className="flex flex-row gap-2 w-full lg:w-auto">
        <button
          onClick={handleSearch}
          className="flex flex-row justify-center items-center p-2 px-6 gap-[10px] w-full lg:w-[74px] h-[43px] bg-[#E73828] rounded-[50.5px] font-['Roboto'] font-bold text-xs leading-[14px] uppercase text-white border border-[#E73828] transition-colors duration-200 hover:bg-white hover:text-[#E73828] hover:border-[#E73828] focus:outline-none focus:ring-2 focus:ring-[#E73828]"
        >
          Search
        </button>
         {(fromDate || toDate) && (
           <button
             onClick={() => {
               onFromDateChange?.('');
               onToDateChange?.('');
               if (onDateChange) {
                 onDateChange('', '');
               }
               // Reset the ref when clearing
               prevDatesRef.current = { fromDate: '', toDate: '' };
             }}
             className="flex flex-row justify-center items-center p-2 px-6 gap-[10px] w-full lg:w-[74px] h-[43px] bg-gray-500 rounded-[50.5px] font-['Roboto'] font-bold text-xs leading-[14px] uppercase text-white border border-gray-500 transition-colors duration-200 hover:bg-white hover:text-gray-500 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
           >
             Clear
           </button>
         )}
      </div>
    </div>
  );
} 