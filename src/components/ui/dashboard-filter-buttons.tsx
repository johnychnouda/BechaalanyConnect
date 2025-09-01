import React from 'react';
import clsx from 'clsx';

interface DashboardFilterButtonProps {
  label?: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  className?: string;
  type?: string;
}

export default function DashboardFilterButton({ 
  label, 
  icon, 
  isActive, 
  onClick,
  className,
  type = 'all'
}: DashboardFilterButtonProps) {
  const getButtonStyles = () => {
    switch (type) {
      case 'purchased':
      case 'transfer':
        return {
          active: 'bg-[#E73828] text-white border-[#E73828]',
          hover: 'hover:bg-[#E73828] hover:text-white hover:border-[#E73828]',
          default: 'border border-[#070707]'
        };
      case 'received':
      case 'refund':
        return {
          active: 'bg-[#5FD568] text-white border-[#5FD568]',
          hover: 'hover:bg-[#5FD568] hover:text-white hover:border-[#5FD568]',
          default: 'border border-[#070707]'
        };
      case 'all':
      default:
        return {
          active: 'bg-[rgba(7,7,7,0.2)] text-[#070707]',
          hover: 'hover:bg-[rgba(7,7,7,0.2)] hover:text-[#070707]',
          default: 'border border-[#070707]'
        };
    }
  };

  const styles = getButtonStyles();

  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex flex-row items-center p-2 px-3 gap-[10px] h-[35px] rounded-[50.5px]',
        'font-["Roboto"] font-normal text-sm leading-4 text-[#070707] dark:text-white',
        isActive ? styles.active : styles.default,
        styles.hover,
        'transition-all duration-200',
        className
      )}
      type="button"
    >
      {icon && (
        <div className="flex items-center justify-center w-[19px] h-[19px]">
          {icon}
        </div>
      )}
      <div className="flex items-center justify-center">
        {label}
      </div>
    </button>
  );
}

interface DashboardFilterButtonGroupProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  className?: string;
  allTransfersLabel?: string;
  receivedFilterLabel?: string;
  purchasedFilterLabel?: string;
}

export function DashboardFilterButtonGroup({
  activeFilter,
  onFilterChange,
  className,
  allTransfersLabel,
  receivedFilterLabel,
  purchasedFilterLabel,
}: DashboardFilterButtonGroupProps) {
  const filters = [
    {
      key: 'all',
      label: allTransfersLabel,
      width: 'w-[103px]',
      type: 'all' as const
    },
    {
      key: 'purchased',
      label: purchasedFilterLabel,
      icon: (
        <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9.50006" cy="9.50006" r="9.50006" fill="#E73828"/>
          <g clipPath="url(#clip0_43_2650)">
            <g filter="url(#filter0_d_43_2650)">
              <path fillRule="evenodd" clipRule="evenodd" d="M9.22023 4.46989C9.29445 4.39576 9.39506 4.35413 9.49995 4.35413C9.60485 4.35413 9.70546 4.39576 9.77968 4.46989L13.4741 8.1575C13.512 8.19399 13.5421 8.23766 13.5629 8.28594C13.5837 8.33422 13.5946 8.38616 13.5951 8.43872C13.5956 8.49128 13.5856 8.54341 13.5657 8.59206C13.5458 8.64072 13.5165 8.68493 13.4793 8.72211C13.4422 8.75929 13.398 8.78871 13.3493 8.80863C13.3007 8.82856 13.2486 8.8386 13.196 8.83817C13.1435 8.83774 13.0915 8.82684 13.0432 8.80612C12.9949 8.7854 12.9512 8.75526 12.9147 8.71747L9.89632 5.7049L9.90212 14.2497C9.90226 14.3547 9.86069 14.4554 9.78656 14.5297C9.71242 14.6041 9.6118 14.6459 9.50681 14.646C9.40183 14.6462 9.30109 14.6046 9.22676 14.5305C9.15243 14.4563 9.11059 14.3557 9.11045 14.2507L9.10517 5.70384L6.08521 8.718C6.04868 8.75579 6.00498 8.78592 5.95668 8.80665C5.90838 8.82737 5.85643 8.83826 5.80387 8.8387C5.75131 8.83913 5.6992 8.82909 5.65056 8.80916C5.60192 8.78923 5.55774 8.75982 5.52059 8.72264C5.48344 8.68545 5.45407 8.64125 5.43419 8.59259C5.41431 8.54393 5.40432 8.49181 5.4048 8.43925C5.40528 8.38669 5.41623 8.33475 5.43699 8.28647C5.45776 8.23819 5.48794 8.19452 5.52576 8.15802L9.22023 4.46989Z" fill="white"/>
            </g>
          </g>
          <defs>
            <filter id="filter0_d_43_2650" x="1.40479" y="4.35413" width="16.1904" height="18.2919" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="4"/>
              <feGaussianBlur stdDeviation="2"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_43_2650"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_43_2650" result="shape"/>
            </filter>
            <clipPath id="clip0_43_2650">
              <rect width="12.6667" height="12.6667" fill="white" transform="translate(3.1665 3.16687)"/>
            </clipPath>
          </defs>
        </svg>
      ),
      width: 'min-w-[114px]',
      type: 'purchased' as const
    },
    {
      key: 'received',
      label: receivedFilterLabel,
      icon: (
        <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform rotate-180">
          <circle cx="9.50006" cy="9.50006" r="9.50006" fill="#5FD568"/>
          <g clipPath="url(#clip0_43_2650)">
            <g filter="url(#filter0_d_43_2650)">
              <path fillRule="evenodd" clipRule="evenodd" d="M9.22023 4.46989C9.29445 4.39576 9.39506 4.35413 9.49995 4.35413C9.60485 4.35413 9.70546 4.39576 9.77968 4.46989L13.4741 8.1575C13.512 8.19399 13.5421 8.23766 13.5629 8.28594C13.5837 8.33422 13.5946 8.38616 13.5951 8.43872C13.5956 8.49128 13.5856 8.54341 13.5657 8.59206C13.5458 8.64072 13.5165 8.68493 13.4793 8.72211C13.4422 8.75929 13.398 8.78871 13.3493 8.80863C13.3007 8.82856 13.2486 8.8386 13.196 8.83817C13.1435 8.83774 13.0915 8.82684 13.0432 8.80612C12.9949 8.7854 12.9512 8.75526 12.9147 8.71747L9.89632 5.7049L9.90212 14.2497C9.90226 14.3547 9.86069 14.4554 9.78656 14.5297C9.71242 14.6041 9.6118 14.6459 9.50681 14.646C9.40183 14.6462 9.30109 14.6046 9.22676 14.5305C9.15243 14.4563 9.11059 14.3557 9.11045 14.2507L9.10517 5.70384L6.08521 8.718C6.04868 8.75579 6.00498 8.78592 5.95668 8.80665C5.90838 8.82737 5.85643 8.83826 5.80387 8.8387C5.75131 8.83913 5.6992 8.82909 5.65056 8.80916C5.60192 8.78923 5.55774 8.75982 5.52059 8.72264C5.48344 8.68545 5.45407 8.64125 5.43419 8.59259C5.41431 8.54393 5.40432 8.49181 5.4048 8.43925C5.40528 8.38669 5.41623 8.33475 5.43699 8.28647C5.45776 8.23819 5.48794 8.19452 5.52576 8.15802L9.22023 4.46989Z" fill="white"/>
            </g>
          </g>
          <defs>
            <filter id="filter0_d_43_2650" x="1.40479" y="4.35413" width="16.1904" height="18.2919" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="4"/>
              <feGaussianBlur stdDeviation="2"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_43_2650"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_43_2650" result="shape"/>
            </filter>
            <clipPath id="clip0_43_2650">
              <rect width="12.6667" height="12.6667" fill="white" transform="translate(3.1665 3.16687)"/>
            </clipPath>
          </defs>
        </svg>
      ),
      width: 'min-w-[104px]',
      type: 'received' as const
    },
  ];

  return (
    <div className={clsx('flex flex-row items-start p-0 gap-4 w-[576px] h-[35px]', className)}>
      {filters.map((filter) => (
        <DashboardFilterButton
          key={filter.key}
          label={filter.label || ''}
          icon={filter.icon}
          isActive={activeFilter === filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={filter.width}
          type={filter.type}
        />
      ))}
    </div>
  );
} 