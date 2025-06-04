import { SVGProps } from "react";

export function CategoryBoxesIcon({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.333 2.02H6.5v4.166H2.333V2.019zM.667 7.852v-7.5h7.5v7.5h-7.5zm1.666 3.333H6.5v4.166H2.333v-4.166zM.667 17.019v-7.5h7.5v7.5h-7.5zm15-15H11.5v4.167h4.167V2.019zM9.833.353v7.5h7.5v-7.5h-7.5zM11.5 11.186h4.167v4.166H11.5v-4.166zm-1.667 5.833v-7.5h7.5v7.5h-7.5z"
        fill="#E73828"
      />
    </svg>
  );
}
