import * as React from "react";
import { SVGProps } from "react";

export function EyeIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M1.667 10C2.892 6.667 6.25 3.75 10 3.75c3.75 0 7.108 2.917 8.333 6.25-1.225 3.333-4.583 6.25-8.333 6.25-3.75 0-7.108-2.917-8.333-6.25z"
        stroke="#E73828"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={10}
        cy={10}
        r={2.5}
        stroke="#E73828"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EyeOffIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M1.667 10C2.892 6.667 6.25 3.75 10 3.75c1.13 0 2.22.19 3.23.54M18.333 10c-.37.98-.97 1.97-1.77 2.89M6.25 6.25l7.5 7.5M12.5 10a2.5 2.5 0 01-2.5 2.5c-.69 0-1.32-.28-1.77-.73"
        stroke="#E73828"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
} 