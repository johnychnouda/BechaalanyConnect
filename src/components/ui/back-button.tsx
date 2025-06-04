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
        "flex items-center gap-2 px-4 py-2 rounded-[50.5px] bg-white text-[#070707] border border-[#E73828] hover:bg-[#E73828] hover:text-white transition-colors duration-200 cursor-pointer",
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
        className="w-5 h-5"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span className="font-medium">{label || "Back"}</span>
    </button>
  );
} 