import { useAppTheme } from "@/hooks/use-app-theme";
import { useIsMounted } from "@/hooks/use-is-mounted";
import * as React from "react";
import { SVGProps } from "react";

export function CloseIcon({ ...props }: SVGProps<SVGSVGElement>) {
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
        d="M8 23.75L6.25 22l7-7-7-7L8 6.25l7 7 7-7L23.75 8l-7 7 7 7L22 23.75l-7-7-7 7z"
        fill={theme === "dark" ? "#fff" : "#000"}
      />
    </svg>
  );
}
