import React from 'react';
import clsx from 'clsx';

interface OrderFilterButtonProps {
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  className?: string;
  type?: 'all' | 'accepted' | 'rejected' | 'pending';
}

export default function OrderFilterButton({ 
  label, 
  icon, 
  isActive, 
  onClick,
  className,
  type = 'all'
}: OrderFilterButtonProps) {
  const getButtonStyles = () => {
    switch (type) {
      case 'accepted':
        return {
          active: 'bg-[#5FD568] text-white border-[#5FD568]',
          hover: 'hover:bg-[#5FD568] hover:text-white hover:border-[#5FD568]',
          default: 'border border-[#5FD568] text-[#5FD568]'
        };
      case 'rejected':
        return {
          active: 'bg-[#E73828] text-white border-[#E73828]',
          hover: 'hover:bg-[#E73828] hover:text-white hover:border-[#E73828]',
          default: 'border border-[#E73828] text-[#E73828]'
        };
      case 'pending':
        return {
          active: 'bg-[#FB923C] text-white border-[#FB923C]',
          hover: 'hover:bg-[#FB923C] hover:text-white hover:border-[#FB923C]',
          default: 'border border-[#FB923C] text-[#FB923C]'
        };
      case 'all':
      default:
        return {
          active: 'bg-[#F3F3F3] text-[#070707] border-[#E0E0E0]',
          hover: 'hover:bg-[#F3F3F3] hover:text-[#070707] hover:border-[#E0E0E0]',
          default: 'bg-[#F3F3F3] text-[#070707] border-[#E0E0E0]'
        };
    }
  };

  const styles = getButtonStyles();

  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex flex-row items-center rounded-[50.5px] px-3 md:px-3 py-1 md:py-2',
        'font-["Roboto"] font-semibold text-[16px] h-[32px] md:h-[35px]',
        'min-w-[120px] flex-1',
        isActive ? styles.active : styles.default,
        styles.hover,
        'transition-all duration-200',
        className
      )}
      type="button"
    >
      {icon && (
        <div className="flex items-center justify-center w-[19px] h-[19px] mr-2">
          {icon}
        </div>
      )}
      <span className="flex-1 text-center">{label}</span>
    </button>
  );
}

interface OrderFilterButtonGroupProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  className?: string;
}

export function OrderFilterButtonGroup({
  activeFilter,
  onFilterChange,
  className
}: OrderFilterButtonGroupProps) {
  const filters = [
    {
      key: 'all',
      label: 'All Orders',
      type: 'all' as const
    },
    {
      key: 'accepted',
      label: 'Accepted',
      type: 'accepted' as const,
      icon: (
        <div className="relative w-[19px] h-[19px]">
          <span className="absolute inset-0 bg-[#5FD568] rounded-full"></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" className="absolute left-[3.17px] top-[3.17px]">
            <path d="M3.5 7.5L6 10L10 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )
    },
    {
      key: 'rejected',
      label: 'Rejected',
      type: 'rejected' as const,
      icon: (
        <div className="relative w-[19px] h-[19px]">
          <span className="absolute inset-0 bg-[#E73828] rounded-full"></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" className="absolute left-[3.17px] top-[3.17px]">
            <rect x="3" y="5.5" width="7" height="1.67" rx="0.8" fill="white" transform="rotate(45 6.335 6.335)"/>
            <rect x="3" y="5.5" width="7" height="1.67" rx="0.8" fill="white" transform="rotate(-45 6.335 6.335)"/>
          </svg>
        </div>
      )
    },
    {
      key: 'pending',
      label: 'Pending',
      type: 'pending' as const,
      icon: (
        <div className="relative w-[19px] h-[19px]">
          <span className="absolute inset-0 bg-[#FB923C] rounded-full"></span>
          <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none" className="absolute left-[3.17px] top-[3.17px]">
            <rect x="5.5" y="3" width="1.67" height="5.5" rx="0.8" fill="white"/>
            <rect x="5.5" y="9.2" width="1.67" height="1.67" rx="0.8" fill="white"/>
          </svg>
        </div>
      )
    }
  ];

  return (
    <div className={clsx('flex flex-row gap-1 md:gap-2 lg:gap-4 items-center w-full min-w-0 overflow-x-auto', className)}>
      {filters.map((filter) => (
        <OrderFilterButton
          key={filter.key}
          label={filter.label}
          icon={filter.icon}
          isActive={activeFilter === filter.key}
          onClick={() => onFilterChange(filter.key)}
          type={filter.type}
        />
      ))}
    </div>
  );
} 