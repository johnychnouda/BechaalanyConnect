import clsx from "clsx";
import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import React, { HTMLAttributes } from "react";

export type ButtonLinkProps = { href?: Url } & HTMLAttributes<HTMLElement>;

export default function ButtonLink({
  children,
  href,
  className,
  ...props
}: ButtonLinkProps) {
  if (href) {
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

  return (
    <div className={clsx("cursor-pointer", className)} {...props}>
      {children}
    </div>
  );
}
