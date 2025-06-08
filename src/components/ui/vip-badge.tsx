import React from 'react';

interface VIPBadgeProps {
  name: string;
  vipLevel: string;
}

export default function VIPBadge({ name, vipLevel }: VIPBadgeProps) {
  return (
    <div className="flex flex-row items-center gap-2 sm:gap-3 flex-wrap">
      <div className="flex-1 min-w-0">
        <span className="uppercase font-roboto font-semibold text-[14px] sm:text-[18px] md:text-[24px] lg:text-[28px] xl:text-[32px] 2xl:text-[36px] leading-[1.2] text-[#E73828] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis block">
          {name}
        </span>
      </div>
      <span className="flex flex-row justify-center items-center border border-[#E73828] rounded-[20px] px-2 py-1 gap-1 min-w-[61px] h-[24px] sm:h-[28px] md:h-[32px] lg:h-[36px] xl:h-[40px] 2xl:h-[44px] shrink-0">
        <span className="font-nunito font-medium text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.2] text-black">
          {vipLevel}
        </span>
        <svg 
          width="11" 
          height="12" 
          viewBox="0 0 11 12" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-[11px] h-[12px] sm:w-[12px] sm:h-[13px] md:w-[13px] md:h-[14px] lg:w-[14px] lg:h-[15px] xl:w-[15px] xl:h-[16px] 2xl:w-[16px] 2xl:h-[17px]"
        >
          <path 
            d="M3.02494 2.01245C2.95107 2.01249 2.87857 2.03237 2.815 2.07C2.75144 2.10764 2.69915 2.16165 2.66359 2.2264L1.15109 4.9764C1.11123 5.04894 1.09411 5.13178 1.10196 5.21418C1.1098 5.29657 1.14225 5.3747 1.19509 5.4384L5.18259 10.2509C5.2213 10.2976 5.26983 10.3352 5.32473 10.361C5.37963 10.3868 5.43955 10.4002 5.50021 10.4002C5.56088 10.4002 5.6208 10.3868 5.6757 10.361C5.7306 10.3352 5.77913 10.2976 5.81784 10.2509L9.80534 5.4384C9.85818 5.3747 9.89063 5.29657 9.89847 5.21418C9.90632 5.13178 9.8892 5.04894 9.84934 4.9764L8.33684 2.2264C8.30124 2.16157 8.24886 2.1075 8.18519 2.06986C8.12152 2.03222 8.0489 2.01239 7.97494 2.01245H3.02494ZM2.28574 4.62495L3.26859 2.83745H4.09359L3.46769 4.62495H2.28574ZM3.37914 5.44995L4.44009 8.06135L2.27584 5.44995H3.37914ZM5.49389 8.4645L4.26959 5.44995H6.68189L5.49389 8.4645ZM4.34219 4.62495L4.96754 2.83745H6.03729L6.69564 4.62495H4.34219ZM7.57509 4.62495L6.91674 2.83745H7.73074L8.71414 4.62495H7.57509ZM7.56849 5.44995H8.72349L6.52074 8.10865L7.56849 5.44995Z" 
            fill="#E73828"
          />
        </svg>
      </span>
    </div>
  );
} 