import { useLanguage } from '@/hooks/use-language';
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangeFilterProps {
  onDateChange?: (from: Date | null, to: Date | null) => void;
  fromDate?: Date | null;
  toDate?: Date | null;
  onFromDateChange?: (date: Date | null) => void;
  onToDateChange?: (date: Date | null) => void;
  onSearch?: () => void;
  fromLabel?: string;
  toLabel?: string;
  searchButton?: string;
}

export default function DateRangeFilter({
  onDateChange,
  fromDate = null,
  toDate = null,
  onFromDateChange,
  onToDateChange,
  onSearch,
  fromLabel,
  toLabel,
  searchButton,
}: DateRangeFilterProps) {
  
  const prevDatesRef = React.useRef({ fromDate: null as Date | null, toDate: null as Date | null });
  const { locale } = useLanguage();
  
  // Call onDateChange whenever both dates are set and have changed
  React.useEffect(() => {
    const prevDates = prevDatesRef.current;
    const currentDates = { fromDate, toDate };
    
    // Only call onDateChange if both dates are set and have actually changed
    if (onDateChange && fromDate && toDate && 
        (prevDates.fromDate?.getTime() !== fromDate.getTime() || prevDates.toDate?.getTime() !== toDate.getTime())) {
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
      <div className="flex flex-col items-start p-0 gap-1 w-full lg:w-[377px] lg:h-[66px] mt-5">
        <span className="w-full lg:w-[377px] h-[19px] font-semibold text-base leading-[19px] text-[#070707] dark:text-white">
          {fromLabel}
        </span>
        <DatePicker
          selected={fromDate}
          onChange={(date) => onFromDateChange?.(date)}
          selectsStart
          startDate={fromDate}
          endDate={toDate}
          placeholderText="dd/mm/yyyy"
          dateFormat="yyyy-MM-dd"
          className="box-border flex flex-row items-center p-3 px-6 gap-[10px] w-full lg:w-[377px] h-[43px] border border-[#070707] dark:border-app-red rounded-[50.5px] font-normal text-base leading-[19px] text-[#070707] dark:text-white bg-white dark:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-app-red"
        />
      </div>
      <div className="flex flex-col items-start p-0 gap-1 w-full lg:w-[377px] lg:h-[66px]">
        <span className="w-full lg:w-[377px] h-[19px] font-semibold text-base leading-[19px] text-[#070707] dark:text-white">
          {toLabel}
        </span>
        <DatePicker
          selected={toDate}
          onChange={(date) => onToDateChange?.(date)}
          selectsEnd
          startDate={fromDate}
          endDate={toDate}
          minDate={fromDate || undefined}
          placeholderText="dd/mm/yyyy"
          dateFormat="yyyy-MM-dd"
          className="box-border flex flex-row items-center p-3 px-6 gap-[10px] w-full lg:w-[377px] h-[43px] border border-[#070707] dark:border-app-red rounded-[50.5px] font-normal text-base leading-[19px] text-[#070707] dark:text-white bg-white dark:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-app-red"
        />
      </div>
      <div className="flex flex-row gap-2 w-full lg:w-auto my-5 lg:my-0">
        <button
          onClick={handleSearch}
          className="flex flex-row justify-center items-center p-2 px-6 gap-[10px] w-auto h-[43px] bg-app-red rounded-[50.5px] font-bold text-xs leading-[14px] uppercase text-white border border-app-red transition-colors duration-200 hover:bg-white hover:text-app-red hover:border-app-red focus:outline-none focus:ring-2 focus:ring-app-red"
        >
          {searchButton}
        </button>
         {(fromDate || toDate) && (
           <button
             onClick={() => {
               onFromDateChange?.(null);
               onToDateChange?.(null);
               if (onDateChange) {
                 onDateChange(null, null);
               }
               // Reset the ref when clearing
               prevDatesRef.current = { fromDate: null, toDate: null };
             }}
             className="flex flex-row justify-center items-center p-2 px-6 gap-[10px] w-auto h-[43px] bg-gray-500 rounded-[50.5px] font-bold text-xs leading-[14px] uppercase text-white border border-gray-500 transition-colors duration-200 hover:bg-white hover:text-gray-500 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
           >
             {locale === 'en' ? 'Clear' : 'مسح'}
           </button>
         )}
      </div>
    </div>
  );
} 