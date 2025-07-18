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
  setIsMobileMenuOpen?: (open: boolean) => void;
};


export default function NavigationMenu({ className, isMobile, setIsMobileMenuOpen }: Props) {
  const pathname = usePathname();
  const { generalData } = useGlobalContext();

  return (
    <div
      className={clsx(
        "flex items-center gap-6 lg:gap-4 flex-nowrap",
        className
      )}
      style={{ minWidth: 0 }}
      onClick={() => setIsMobileMenuOpen?.(false)}
    >
      {generalData?.menu_items.map((item, index) => (
        <Link
          key={index}
          href={item.slug.startsWith('/') ? item.slug : `/${item.slug}`}
          className={clsx(
            "cursor-pointer font-semibold hover:text-app-red flex items-center gap-0.5 sm:gap-1.5 whitespace-nowrap",
            pathname === item.slug && "text-app-red",
          )}
        >
          <div className={clsx(
            "flex items-center justify-center me-2 md:me-0",
            isMobile ? "w-5 h-5" : "w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
          )}>
            <Image
              src={item.full_path.icon}
              alt={item.title}
              width={20}
              height={20}
              style={{ width: "100%", height: "auto" }} // or height: "100%", width: "auto"
              className="object-contain"
            />
          </div>
          <p className={clsx(
            "font-semibold",
            isMobile ? "text-[14px] sm:text-base" : "text-[14px] sm:text-[16px] lg:text-[18px]"
          )}>{item.title}</p>
        </Link>
      ))}
    </div>
  );
} 