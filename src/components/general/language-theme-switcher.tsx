import React from "react";
import { useRouter } from "next/router";
import { useIsMounted } from "@/hooks/use-is-mounted";
import ButtonLink from "../ui/button-link";
import { useGlobalContext } from "@/context/GlobalContext";

export default function LanguageThemeSwitcher({ }) {
  const { generalData } = useGlobalContext();
  const router = useRouter();
  const isMounted = useIsMounted();
  const isEnActive = router.locale === "en";

  const changeLocale = (locale: string) => {
    router.push(router.asPath, undefined, { locale });
  };

  if (!isMounted) return null;

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
      <div className="flex items-center gap-[3px] sm:gap-[5px] md:gap-[7px]">
        <ButtonLink
          onClick={() => changeLocale("en")}
          className={isEnActive ? "text-app-white text-[10px] sm:text-xs md:text-sm" : "text-app-black text-[10px] sm:text-xs md:text-sm"}
        >
          {generalData?.locale.en.title}
        </ButtonLink>
        <div className="bg-app-white h-[10px] sm:h-[12px] md:h-[14px] w-[1px]" />
        <ButtonLink
          onClick={() => changeLocale("ar")}
          className={isEnActive ? "text-app-black text-[10px] sm:text-xs md:text-sm" : "text-app-white text-[10px] sm:text-xs md:text-sm"}
        >
          {generalData?.locale.ar.title}
        </ButtonLink>
      </div>
    </div>
  );
}
