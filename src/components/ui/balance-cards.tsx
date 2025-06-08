import React from 'react';

interface BalanceCardProps {
  title: string;
  amount: string;
  color: string;
}

const BalanceCard = ({ title, amount, color }: BalanceCardProps) => (
  <div className="flex flex-col justify-center items-start p-[16px_12px] sm:p-[21px_16px] gap-[8px] sm:gap-[10px] w-full sm:w-[277px] h-[90px] sm:h-[104px] bg-[rgba(7,7,7,0.1)] rounded-[10px] overflow-hidden shrink-0">
    <div className="flex flex-col items-start p-0 gap-1.5 sm:gap-2 w-full">
      <span className="font-roboto font-semibold text-sm sm:text-base leading-[17px] sm:leading-[19px] text-[#070707] whitespace-nowrap overflow-ellipsis overflow-hidden">
        {title}
      </span>
      <span className={`font-roboto font-semibold text-xl sm:text-2xl leading-[24px] sm:leading-[28px] ${color} whitespace-nowrap overflow-ellipsis overflow-hidden`}>
        {amount}
      </span>
    </div>
  </div>
);

export default function BalanceCards() {
  return (
    <div className="flex flex-row gap-3 sm:gap-4 w-full overflow-x-auto pb-4 scrollbar-hide">
      <BalanceCard 
        title="Your Balance"
        amount="50.00 $"
        color="text-[#5FD568]"
      />
      <BalanceCard 
        title="Total Purchases"
        amount="320.00 $"
        color="text-[#E73828]"
      />
      <BalanceCard 
        title="Received"
        amount="370.00 $"
        color="text-[#5FD568]"
      />
    </div>
  );
} 