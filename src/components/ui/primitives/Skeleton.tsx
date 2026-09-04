import clsx from "clsx";
import React from "react";

/**
 * The shared skeleton primitive. Before this, the app had exactly one skeleton
 * shape (`ui/card-skeleton.tsx`, fit only to a product/category card) and every
 * other loading state was a bare spinner — including the product detail page,
 * whose loading state rendered a 4-up grid of *card* skeletons even though
 * nothing about the page that follows looks like a card grid.
 *
 * `Skeleton` is the raw pulsing block; `SkeletonText` / `SkeletonRow` compose it
 * into the two other shapes the app actually needs (paragraph lines, list rows —
 * orders, payments, dashboard summary tiles).
 */

interface SkeletonProps {
  className?: string;
  /** Defaults to a small rounded rect; pass `rounded-full` for avatars/dots. */
  rounded?: string;
}

export function Skeleton({ className, rounded = "rounded-md" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx("animate-pulse bg-neutral-200 dark:bg-gray-700", rounded, className)}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export function SkeletonText({ lines = 2, className, lastLineWidth = "w-2/3" }: SkeletonTextProps) {
  return (
    <div className={clsx("flex flex-col gap-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={clsx("h-3", i === lines - 1 ? lastLineWidth : "w-full")}
        />
      ))}
    </div>
  );
}

interface SkeletonRowProps {
  className?: string;
  /** Show a leading circular icon/avatar placeholder. */
  withIcon?: boolean;
}

export function SkeletonRow({ className, withIcon = true }: SkeletonRowProps) {
  return (
    <div
      className={clsx(
        "flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-gray-700",
        className
      )}
      aria-hidden="true"
    >
      {withIcon && <Skeleton rounded="rounded-full" className="h-10 w-10 shrink-0" />}
      <div className="flex-1 min-w-0">
        <SkeletonText lines={2} lastLineWidth="w-1/3" />
      </div>
    </div>
  );
}

export default Skeleton;
