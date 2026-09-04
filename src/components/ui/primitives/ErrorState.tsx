import React from "react";
import clsx from "clsx";
import { Button } from "./Button";

/**
 * Consolidates three divergent error treatments (a red toast, an inline
 * `bg-red-50` banner, and a centered block with a "Try again" button) into one.
 * `my-orders.tsx` used to render the banner AND the centered block for the same
 * `error` state simultaneously — this is the single replacement for both.
 *
 * Takes an already-localized `message` string (produced by
 * `toMessage(error, locale)` from src/utils/error-message.ts) rather than the
 * raw error, so this component stays presentation-only.
 */

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({ message, onRetry, retryLabel, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={clsx("flex flex-col items-center justify-center text-center py-8 px-4 gap-3", className)}
    >
      <p className="text-app-red font-medium">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="primary">
          {retryLabel ?? "Try again"}
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
