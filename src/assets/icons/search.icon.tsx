import * as React from "react";
import { SVGProps } from "react";

export function SearchIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={25}
      height={26}
      viewBox="0 0 25 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M11.458 19.978a8.333 8.333 0 100-16.667 8.333 8.333 0 000 16.667zM21.875 22.061l-4.48-4.48"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
