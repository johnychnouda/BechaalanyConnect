import React from "react";
import clsx from "clsx";
import { Button, ButtonProps } from "./Button";

/**
 * Five hand-rolled empty states existed before this (search modal, search page,
 * my-orders, dashboard transactions, notifications), three of them dead ends
 * with no way forward. This is the shared shape: optional icon, a message, and
 * an optional CTA — modelled on my-orders.tsx's "No orders found. [Browse
 * products]" pattern, which was the one instance that already got this right.
 */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: ButtonProps["variant"];
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx("flex flex-col items-center justify-center text-center py-8 px-4 gap-2", className)}>
      {icon && (
        <div className="text-neutral-400 dark:text-gray-500 mb-1" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="font-medium text-app-black dark:text-white">{title}</p>
      {description && (
        <p className="text-sm text-neutral-400 dark:text-gray-400 max-w-sm">{description}</p>
      )}
      {action && (
        <div className="mt-3">
          {action.href ? (
            <Button href={action.href} size="sm" variant={action.variant ?? "primary"}>
              {action.label}
            </Button>
          ) : (
            <Button onClick={action.onClick} size="sm" variant={action.variant ?? "primary"}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
