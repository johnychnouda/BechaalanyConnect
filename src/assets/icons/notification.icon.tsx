import React from "react";
import { SVGProps } from "react";

export default function NotificationIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M12 22c1.2 0 2.1-.9 2.1-2.1h-4.2C9.9 21.1 10.8 22 12 22z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M18.5 16v-5.2c0-3.6-2.9-6.3-6.5-6.3s-6.5 2.7-6.5 6.3V16l-1.5 1.5V19h16V17.5L18.5 16z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="8.5"
        r="0.7"
        fill="currentColor"
      />
    </svg>
  );
} 