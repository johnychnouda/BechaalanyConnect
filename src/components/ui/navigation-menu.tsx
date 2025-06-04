import React from "react";
import { useRouter } from "next/router";
import { IconButton } from "./icon-button";
import { CategoryBoxesIcon } from "@/assets/icons/category-boxes.icon";
import { AboutIcon } from "@/assets/icons/about.icon";
import { ContactIcon } from "@/assets/icons/contact.icon";
import { menuItem } from "@/types/globalSettings.type";
import clsx from "clsx";

type Props = {
  items?: menuItem[];
  className?: string;
  isMobile?: boolean;
};

export default function NavigationMenu({ items, className, isMobile = false }: Props) {
  const router = useRouter();
  const currentPath = router.asPath;

  const defaultItems = [
    { id: "categories", title: "CATEGORIES", slug: "/categories", icon: <CategoryBoxesIcon /> },
    { id: "about", title: "ABOUT US", slug: "/about-us", icon: <AboutIcon /> },
    { id: "contact", title: "CONTACT US", slug: "/contact-us", icon: <ContactIcon /> },
  ];

  const menuItems = items?.length ? items : defaultItems;

  return (
    <div className={clsx(
      "flex items-center gap-8",
      isMobile ? "flex-col" : "hidden lg:flex",
      className
    )}>
      {menuItems.map((item) => (
        <IconButton
          key={item.id}
          href={item.slug}
          icon={item.icon}
          className={clsx(
            "font-semibold text-[16px] hover:text-app-red",
            currentPath === item.slug && "text-app-red"
          )}
        >
          {item.title}
        </IconButton>
      ))}
    </div>
  );
} 