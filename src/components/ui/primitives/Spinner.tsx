import clsx from "clsx";
import React from "react";

/**
 * Replaces two things that existed independently and disagreed with each other:
 *
 * 1. `ui/loading-spinner.tsx`'s `LoadingSpinner` — imported by zero pages. It set
 *    `style={{ borderColor: color }}` (all four sides) on an element whose class
 *    was `border-b-2` (one side, 2px). Tailwind's utility class wins in the
 *    cascade for the sides it targets, so in practice this rendered a solid ring
 *    with one slightly different edge, not a rotating arc.
 * 2. ~10 pages hand-rolling `<div className="animate-spin rounded-full h-8 w-8
 *    border-b-2 border-[#E73828]"></div>` inline — same bug, copy-pasted.
 *
 * This uses the standard "transparent top edge" arc technique so the spin is
 * actually visible, and a `currentColor` mode so it can render white inside a
 * solid red Button.
 */

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
} as const;

export type SpinnerSize = keyof typeof sizeClasses;

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  /** Use the inherited text color (e.g. white text inside a solid Button) instead of app-red. */
  currentColor?: boolean;
  label?: string;
}

export function Spinner({ size = "md", className, currentColor, label }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label ?? "Loading"}
      className={clsx(
        "inline-block animate-spin rounded-full border-solid border-t-transparent",
        sizeClasses[size],
        currentColor ? "border-current" : "border-app-red",
        className
      )}
    />
  );
}

export default Spinner;
