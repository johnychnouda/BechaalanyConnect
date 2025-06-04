import * as React from "react";
import { SVGProps } from "react";

export function HeadsetIcon({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={18}
      viewBox="0 0 16 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M1.333 10.353v-2.5a6.667 6.667 0 0113.334 0v2.5M13 14.519c0 1.381-2.238 2.5-5 2.5"
        stroke="#E73828"
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.333 10.353A1.667 1.667 0 013 8.686h.833A1.667 1.667 0 015.5 10.353v2.5a1.667 1.667 0 01-1.667 1.666H3a1.666 1.666 0 01-1.667-1.666v-2.5zm9.167 0a1.667 1.667 0 011.667-1.667H13a1.667 1.667 0 011.667 1.667v2.5A1.667 1.667 0 0113 14.519h-.833a1.667 1.667 0 01-1.667-1.666v-2.5z"
        stroke="#E73828"
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default HeadsetIcon;
