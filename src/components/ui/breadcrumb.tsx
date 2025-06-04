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
    <div className={clsx("text-sm text-gray-600 mb-4", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="mx-2">/</span>}
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-app-red transition-colors">
                {item.label}
              </Link>
            ) : isLast ? (
              <span className="text-app-red font-bold" aria-current="page">{item.label}</span>
            ) : (
              <span>{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
} 