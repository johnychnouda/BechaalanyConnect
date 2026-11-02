import React from 'react';
import clsx from 'clsx';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

type PageItem = number | 'ellipsis';

/**
 * The page numbers to render: always the first and last page, the current page
 * with `siblings` on each side, and an ellipsis for each gap. The bar always has
 * the same number of slots, so it doesn't jump in width as you page — near an
 * edge the window widens instead. With 22 pages:
 * 1 → `1 2 3 4 5 … 22`, 8 → `1 … 7 8 9 … 22`, 22 → `1 … 18 19 20 21 22`.
 */
export function getPageItems(current: number, total: number, siblings = 1): PageItem[] {
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const edgeWindow = 3 + siblings * 2;

  if (total <= edgeWindow + 2) return range(1, total);
  if (current <= siblings + 3) return [...range(1, edgeWindow), 'ellipsis', total];
  if (current >= total - siblings - 2)
    return [1, 'ellipsis', ...range(total - edgeWindow + 1, total)];
  return [1, 'ellipsis', ...range(current - siblings, current + siblings), 'ellipsis', total];
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  locale?: string;
  className?: string;
}

const pill = 'rounded-full border border-app-red text-app-black dark:text-white';
const interactive = 'hover:bg-app-red hover:text-white';

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  locale,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const isAr = locale === 'ar';
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;
  // Chevrons point the way the page moves, which flips under RTL.
  const PrevIcon = isAr ? ChevronRightIcon : ChevronLeftIcon;
  const NextIcon = isAr ? ChevronLeftIcon : ChevronRightIcon;
  const prevLabel = isAr ? 'السابق' : 'Prev';
  const nextLabel = isAr ? 'التالي' : 'Next';

  const renderPageList = (items: PageItem[], listClassName: string) => (
    <ul className={clsx('items-center gap-1.5 sm:gap-2', listClassName)}>
      {items.map((item, idx) =>
        item === 'ellipsis' ? (
          <li
            key={`ellipsis-${idx}`}
            className="px-1 text-app-black dark:text-white select-none"
            aria-hidden="true"
          >
            …
          </li>
        ) : (
          <li key={item}>
            <button
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === currentPage ? 'page' : undefined}
              className={clsx(
                'min-w-[2.25rem] px-2 sm:px-3 py-1 rounded-full border',
                item === currentPage
                  ? 'bg-app-red text-white border-app-red'
                  : clsx('border-app-red text-app-black dark:text-white', interactive)
              )}
            >
              {item}
            </button>
          </li>
        )
      )}
    </ul>
  );

  return (
    <nav
      aria-label={isAr ? 'ترقيم الصفحات' : 'Pagination'}
      className={clsx('flex justify-center items-center gap-2 mt-6', className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        aria-label={prevLabel}
        className={clsx(
          'flex items-center gap-1 px-3 py-1',
          pill,
          isFirst ? 'opacity-50 cursor-not-allowed' : interactive
        )}
      >
        <PrevIcon className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">{prevLabel}</span>
      </button>

      {/* Announced to screen readers; the numbers below are the visible state. */}
      <span className="sr-only" aria-live="polite">
        {isAr ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
      </span>

      {/* Mobile keeps the numbers too (they used to be replaced by "Page X of Y",
          which read as missing 1-2-3 buttons), just without the current page's
          neighbours, so the bar fits a 375px screen. */}
      {renderPageList(getPageItems(currentPage, totalPages, 0), 'flex sm:hidden')}
      {renderPageList(getPageItems(currentPage, totalPages), 'hidden sm:flex')}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        aria-label={nextLabel}
        className={clsx(
          'flex items-center gap-1 px-3 py-1',
          pill,
          isLast ? 'opacity-50 cursor-not-allowed' : interactive
        )}
      >
        <span className="hidden sm:inline">{nextLabel}</span>
        <NextIcon className="w-4 h-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

export default Pagination;
