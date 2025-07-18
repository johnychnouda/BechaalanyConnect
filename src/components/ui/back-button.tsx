import React from "react";
import { useRouter } from "next/router";
import clsx from "clsx";

type Props = {
  href?: string;
  className?: string;
  label?: string;
};

export default function BackButton({ href, className, label }: Props) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={clsx(
        "flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-[50.5px] bg-white text-[#070707] border border-[#E73828] hover:bg-[#E73828] hover:text-white active:bg-[#E73828] active:text-white focus:bg-[#E73828] focus:text-white focus-visible:bg-[#E73828] focus-visible:text-white transition-colors duration-200 cursor-pointer",
        className
      )}
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rtl:rotate-180"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span className="font-medium text-xs sm:text-sm">{label || "Back"}</span>
    </button>
  );
} 