import clsx from "clsx";
import React, { HTMLAttributes, PropsWithChildren } from "react";

export default function PageLayout({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return (
    <main
      className={clsx("bg-background-light dark:bg-background-dark", className)}
      {...props}
    >
      {children}
    </main>
  );
}
