import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  valueColor: string;
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  valueColor,
  className = '',
}) => {
  return (
    <div className={`flex flex-col justify-center items-start p-4 md:p-[21px_16px] gap-[10px] w-full h-[104px] bg-[rgba(7,7,7,0.1)] rounded-[10px] overflow-hidden ${className}`}>
      <div className="flex flex-col items-start p-0 gap-2 w-full">
        <span className="font-['Roboto'] font-semibold text-base leading-[19px] text-[#070707]">
          {title}
        </span>
        <span className={`font-['Roboto'] font-semibold text-xl md:text-2xl leading-[28px] ${valueColor}`}>
          {value}
        </span>
      </div>
    </div>
  );
}; 