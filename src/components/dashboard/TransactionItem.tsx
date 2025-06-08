import React from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '@/utils/date';

interface TransactionItemProps {
  title: string;
  date: string;
  direction: 'up' | 'down';
  oldPrice: string;
  newPrice: string;
  index: number;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  title,
  date,
  direction,
  oldPrice,
  newPrice,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-row justify-between items-center p-3 gap-2 w-full max-w-full h-[66px] bg-[rgba(7,7,7,0.05)] rounded-[20px] md:rounded-[50.5px] overflow-x-auto"
    >
      {/* Left Section - Icon, Title, Date */}
      <div className="flex flex-row items-center p-0 gap-4 min-w-0 flex-1">
        {/* Icon Circle */}
        <div className="relative w-9 h-9 flex-shrink-0">
          <div className={`absolute w-9 h-9 rounded-full ${direction === 'up' ? 'bg-[#E73828]' : 'bg-[#5FD568]'}`}></div>
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            className={`absolute left-[6px] top-[6px] ${direction === 'down' ? 'transform rotate-180' : ''}`}
          >
            <path 
              d="M12 5V19M12 5L5 12M12 5L19 12" 
              stroke="white" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {/* Title and Date */}
        <div className="flex flex-col justify-center items-start p-0 gap-1 min-w-0">
          <div className="flex flex-row items-center p-0 gap-1 w-full">
            <span className="font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] truncate">
              {title.split(' | ')[0]}
            </span>
            {title.includes(' | ') && (
              <>
                <span className="w-[1px] h-3 bg-[#E73828] flex-shrink-0"></span>
                <span className="font-['Roboto'] font-normal text-base leading-[19px] text-[#070707] truncate">
                  {title.split(' | ')[1]}
                </span>
              </>
            )}
          </div>
          <span className="font-['Roboto'] font-normal text-xs leading-[14px] text-[#8E8E8E]">
            {formatDate(date)}
          </span>
        </div>
      </div>
      {/* Right Section - Prices */}
      <div className="flex flex-row justify-end items-center gap-2 flex-shrink-0">
        <span className="font-['Roboto'] font-normal text-base leading-[19px] line-through text-[#E73828] text-right">
          {oldPrice}
        </span>
        <span className="font-['Roboto'] font-normal text-base leading-[19px] text-[#5FD568] text-right">
          {newPrice}
        </span>
      </div>
    </motion.div>
  );
}; 