import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
  className?: string;
};

export default function Breadcrumb({ items, className }: Props) {
  return (
    <nav aria-label="Breadcrumb" className={clsx("w-full overflow-x-auto mb-4", className)}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[clamp(12px,3vw,15px)] text-gray-600 dark:text-gray-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-x-1">
              {index > 0 && <span className="mx-1 text-[clamp(10px,2.5vw,13px)]" aria-hidden="true">/</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-app-red transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-none">
                  {item.label}
                </Link>
              ) : isLast ? (
                <span className="text-app-red font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-none" aria-current="page">{item.label}</span>
              ) : (
                <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-none">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
