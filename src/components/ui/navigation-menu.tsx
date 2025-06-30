/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import Link from "next/link";
import { useGlobalContext } from "@/context/GlobalContext";
import Image from "next/image";

type Props = {
  className?: string;
  isMobile?: boolean;
};


export default function NavigationMenu({ className, isMobile }: Props) {
  const pathname = usePathname();
  const { generalData } = useGlobalContext();

  return (
    <div
      className={clsx(
        "flex items-center gap-6 lg:gap-4 flex-nowrap",
        className
      )}
      style={{ minWidth: 0 }}
    >
      {generalData?.menu_items.map((item, index) => (
        <Link
          key={index}
          href={item.slug}
          className={clsx(
            "cursor-pointer font-semibold hover:text-app-red flex items-center gap-0.5 sm:gap-1.5 whitespace-nowrap",
            pathname === item.slug && "text-app-red",
            isMobile ? "text-[10px] sm:text-xs" : "text-[11px] sm:text-[14px] lg:text-[16px]"
          )}
        >
          <div className={clsx(
            "flex items-center justify-center",
            isMobile ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
          )}>
            <Image
              src={item.full_path.icon}
              alt={item.title}
              width={20}
              height={20}
            />
          </div>
          <p className={clsx(
            "font-semibold",
            isMobile ? "text-[10px] sm:text-xs" : "text-[11px] sm:text-[14px] lg:text-[16px]"
          )}>{item.title}</p>
        </Link>
      ))}
    </div>
  );
} 