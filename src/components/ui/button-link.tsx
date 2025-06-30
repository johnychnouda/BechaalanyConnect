import clsx from "clsx";
import Link from "next/link";
import React, { HTMLAttributes } from "react";

export type ButtonLinkProps = { href?: string, target?: string } & HTMLAttributes<HTMLElement>;

export default function ButtonLink({
  children,
  href,
  className,
  target,
  ...props
}: ButtonLinkProps) {
  if (href && !target) {
    return (
      <Link
        href={href}
        className={clsx("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Link>
    );
  }

  if (target && href) {
    return (
      <a href={href} target="_blank" className={clsx("cursor-pointer", className)} {...props}>
        {children}
      </a>
    );
  }

  return (
    <div className={clsx("cursor-pointer", className)} {...props}>
      {children}
    </div>
  );
}
