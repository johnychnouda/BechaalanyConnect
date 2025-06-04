import React from "react";

interface SummaryCardProps {
  title: string;
  value: string;
  valueClassName?: string;
}

export default function SummaryCard({ title, value, valueClassName }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-[20px] flex flex-col items-start justify-center py-[36px] px-10 gap-[18px] min-h-[130px] w-full shadow-[0_2px_12px_0_rgba(0,0,0,0.06)] border border-[#E0E0E0]">
      <span className="text-[#070707] text-[20px] font-extrabold leading-[24px]">{title}</span>
      <span className={`text-[36px] font-black leading-[40px] ${valueClassName}`}>{value}</span>
    </div>
  );
} 