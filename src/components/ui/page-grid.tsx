import { useGlobalContext } from "@/context/GlobalContext";
import ButtonLink from "./button-link";
import clsx from "clsx";
import React from "react";
import { useRouter } from "next/router";

type Props<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  label?: string;
  viewMoreHref?: string;
  itemsContainerClassName?: string;
};

export default function PageGrid<T>({
  items,
  renderItem,
  label,
  viewMoreHref,
  itemsContainerClassName,
}: Props<T>) {
  const { locale } = useRouter();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        {label && (
          <p className="text-app-red text-[20px] sm:text-[36px] font-semibold">
            {label.toUpperCase()}
          </p>
        )}
        {viewMoreHref && (
          <ButtonLink
            href={viewMoreHref}
            className="text-app-red font-semibold text-[16px] sm:text-[20px] underline"
          >
            {
              locale === "ar" ? "عرض الكل" : "View All"
            }
          </ButtonLink>
        )}
      </div>
      <div
        className={clsx(
          "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
          itemsContainerClassName
        )}
      >
        {items.map(renderItem)}
      </div>
    </div>
  );
}
