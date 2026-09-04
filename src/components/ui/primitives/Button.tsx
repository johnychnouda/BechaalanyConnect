import clsx from "clsx";
import Link from "next/link";
import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner } from "./Spinner";

/**
 * The shared Button primitive the storefront never had. Before this, 88 raw
 * `<button>` elements each re-declared their own version of
 * `px-5 py-2 rounded-[25px] bg-[#E73828] text-white hover:bg-[#d63224]`
 * (or the inverse "outline that fills on hover" variant), with no shared
 * disabled state, no shared loading state, and no focus ring.
 *
 * The `loading` prop keeps the button's width stable: children stay in the
 * layout (opacity-0) instead of being swapped for a bare spinner, which used
 * to make CTAs disappear and reflow the page on submit
 * (categories/[category]/[subcategory]/[productId].tsx's Buy Now button).
 */

const variantClasses = {
  primary:
    "bg-app-red text-white border-2 border-app-red hover:bg-app-red-hover hover:border-app-red-hover",
  outline:
    "bg-transparent text-app-red border-2 border-app-red hover:bg-app-red hover:text-white",
  ghost:
    "bg-transparent text-app-red border-2 border-transparent hover:bg-app-red/10",
  danger:
    "bg-transparent text-app-red border-2 border-app-red hover:bg-app-red hover:text-white",
} as const;

const sizeClasses = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-5 py-2 gap-2",
  lg: "text-base px-6 py-3 gap-2",
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
  disabled?: boolean;
  "aria-label"?: string;
  onClick?: React.MouseEventHandler;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseClasses =
  "relative inline-flex items-center justify-center rounded-btn font-semibold whitespace-nowrap transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", fullWidth, loading, className, children, ...props },
    ref
  ) {
    const classes = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && "w-full",
      className
    );

    const content = (
      <>
        <span className={clsx("inline-flex items-center gap-2", loading && "invisible")}>
          {children}
        </span>
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <Spinner size="sm" currentColor />
          </span>
        )}
      </>
    );

    if ("href" in props && props.href) {
      const { href, target, disabled, ...anchorProps } = props as ButtonAsLink;

      if (target === "_blank") {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(classes, disabled && "opacity-50 pointer-events-none")}
            aria-disabled={disabled}
            {...anchorProps}
          >
            {content}
          </a>
        );
      }

      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={clsx(classes, disabled && "opacity-50 pointer-events-none")}
          aria-disabled={disabled}
          {...anchorProps}
        >
          {content}
        </Link>
      );
    }

    const { type = "button", disabled, ...buttonProps } = props as ButtonAsButton;

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={classes}
        {...buttonProps}
      >
        {content}
      </button>
    );
  }
);

export default Button;
