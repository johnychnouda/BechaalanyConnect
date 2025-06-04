import React from "react";

interface FilterChipProps {
  label: string;
  active?: boolean;
  colorClassName?: string;
  onClick?: () => void;
}

export default function FilterChip({ label, active, colorClassName = '', onClick }: FilterChipProps) {
  return (
    <button
      className={`px-7 py-3 rounded-full text-[18px] leading-[20px] font-extrabold uppercase tracking-wide transition-colors border flex items-center gap-2 shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]
        ${active ? 'bg-[#E73828] text-white border-transparent' : 'bg-white text-[#070707] border-[#E0E0E0]'}
      `}
      onClick={onClick}
      type="button"
      style={{ fontWeight: 800 }}
    >
      {label}
    </button>
  );
} 