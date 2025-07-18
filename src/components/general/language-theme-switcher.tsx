import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useIsMounted } from "@/hooks/use-is-mounted";
import ButtonLink from "../ui/button-link";
import { useGlobalContext } from "@/context/GlobalContext";

export default function LanguageThemeSwitcher({ isMobileMenu, setIsMobileMenuOpen }: { isMobileMenu?: boolean, setIsMobileMenuOpen?: (isOpen: boolean) => void }) {
  const { generalData } = useGlobalContext();
  const router = useRouter();
  const isMounted = useIsMounted();
  const isEnActive = router.locale === "en";
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleStop = () => setIsLoading(false);
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);
    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router.events]);

  const changeLocale = (locale: string) => {
    setIsLoading(true);
    router.push(router.asPath, undefined, { locale });
    setIsMobileMenuOpen?.(false);
  };

  if (!isMounted) return null;

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
          <span className="loader border-2 border-t-2 border-gray-200 rounded-full w-5 h-5 animate-spin border-t-app-black"></span>
        </div>
      )}
      <div className="flex items-center gap-[3px] sm:gap-[5px] md:gap-[7px]">
        <ButtonLink
          onClick={() => changeLocale("en")}
          className={
            `${isEnActive
              ? isMobileMenu
                ? "text-red-500 text-[14px]  md:text-sm"
                : "text-app-white text-[12px]  md:text-sm"
              : "text-app-black text-[14px]  md:text-sm"}`
          }
        >
          {generalData?.locale.en.title}
        </ButtonLink>
        <div className={`${isMobileMenu ? "bg-app-red" : "bg-app-white"} h-[10px] sm:h-[12px] md:h-[14px] w-[1px]`} />
        <ButtonLink
          onClick={() => changeLocale("ar")}
          className={
            `${!isEnActive
              ? isMobileMenu
                ? "text-red-500 text-[14px] md:text-sm"
                : "text-app-white text-[12px] md:text-sm"
              : "text-app-black text-[14px] md:text-sm"}`
          }
        >
          {generalData?.locale.ar.title}
        </ButtonLink>
      </div>
    </div>
  );
}
