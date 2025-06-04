import { useAppTheme } from "@/hooks/use-app-theme";
import { useIsMounted } from "@/hooks/use-is-mounted";
import * as React from "react";
import { SVGProps } from "react";

export function BurgerIcon({ ...props }: SVGProps<SVGSVGElement>) {
  const isMounted = useIsMounted();

  const { theme } = useAppTheme();

  if (!isMounted) return null;

  return (
    <svg
      width={30}
      height={30}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3.75 22.5V20h22.5v2.5H3.75zm0-6.25v-2.5h22.5v2.5H3.75zm0-6.25V7.5h22.5V10H3.75z"
        fill={theme === "dark" ? "#fff" : "#000"}
      />
    </svg>
  );
}
