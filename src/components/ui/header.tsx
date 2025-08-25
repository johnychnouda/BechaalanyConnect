import React, { PropsWithChildren, useContext, useEffect, useState } from "react";
import PageLayout from "./page-layout";
import { LogoIcon } from "@/assets/icons/logo.icon";
import { useAppTheme } from "@/hooks/use-app-theme";
import { LogoWhiteIcon } from "@/assets/icons/logo-white.icon";
import { useIsMounted } from "@/hooks/use-is-mounted";
import ButtonLink from "./button-link";
import ProfileIcon from "@/assets/icons/profile.icon";
import NavigationMenu from "./navigation-menu";
import ThemeSwitcher from "../general/theme-switcher";
import { useAuth } from "@/context/AuthContext";
import BlurredPrice from "./BlurredPrice";
import Notification from "./notification";
import { useNotificationStore } from "@/store/notification.store";
import { useCreditsBalance, useIsCreditsUpdating } from "@/store/credits.store";
import { useRouter } from "next/router";
import Image from "next/image";
import { useGlobalContext } from "@/context/GlobalContext";
import { BurgerIcon } from "@/assets/icons/burger.icon";
import { useLanguage } from "@/hooks/use-language";
import MobileMenu from "./MobileMenu";
import SearchModal from "./SearchModal";
import { SearchIcon } from "@/assets/icons/search.icon";
import { LoginIcon } from "@/assets/icons/login.icon";

export default function Header({ children }: PropsWithChildren) {
  const { generalData } = useGlobalContext();
  const { theme } = useAppTheme();
  const isMounted = useIsMounted();
  const { isAuthenticated, user } = useAuth();
  const { count } = useNotificationStore();
  const { isRTL } = useLanguage();
  const creditsBalance = useCreditsBalance();
  const isCreditsUpdating = useIsCreditsUpdating();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  if (!isMounted) return null;



  return (
    <>
      {/* Main Header */}
      <PageLayout className="sticky top-0 py-1 px-2 sm:px-2 md:px-6 lg:px-8 z-40 sm:py-2  lg:py-3 flex items-center w-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] bg-background-light dark:bg-background-dark overflow-x-auto whitespace-nowrap">
        {/* Left: Logo and Theme Switcher */}
        <div className="flex items-center justify-between lg:justify-center w-full lg:w-auto">
          {/* Burger Icon for Mobile */}
          <button
            className="lg:hidden p-1 rounded focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            type="button"
          >
            <BurgerIcon className="text-app-red" />
          </button>
          <ButtonLink
            href="/"
            className="w-[100px] sm:w-[150px] lg:w-[200px] min-w-0"
          >
            {theme === "dark" ? (
              generalData?.settings?.full_path?.dark_mode_logo && (
                <Image src={generalData?.settings?.full_path?.dark_mode_logo} alt="Dark Mode Logo" width={160} height={55} />
              )
            ) : (
              generalData?.settings?.full_path?.logo && (
                <Image src={generalData?.settings?.full_path?.logo} alt="Logo" width={160} height={55} />
              )
            )}
          </ButtonLink>
          <div className="flex items-center justify-center">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Center: Navigation Menu (desktop only) */}
        <div className="hidden lg:flex flex-1 justify-center items-center gap-2 lg:gap-8 min-w-0">
          <NavigationMenu />
        </div>


        {/* Right: User Actions or Auth Buttons */}
        <div className="hidden lg:flex items-center  gap-1 sm:gap-2 lg:gap-4 ml-auto flex-nowrap min-w-0 max-w-full overflow-x-auto whitespace-nowrap">
          {isAuthenticated ? (
            <>
              <Notification
                count={count}
              />
              {user && (
                <div className="flex items-center gap-2">
                  <BlurredPrice 
                    price={creditsBalance || user.credits_balance || 0} 
                    className={isCreditsUpdating ? 'opacity-50 transition-opacity' : ''} 
                  />
                </div>
              )}
              <ButtonLink
                href="/account-dashboard"
                className="transition-all duration-200 hover:bg-app-red p-1 sm:p-2 rounded-full group min-w-0"
              >
                <ProfileIcon className="w-5 h-5 sm:w-5 sm:h-5 text-app-red group-hover:text-white" />
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink
                href="/auth/signup"
                className="flex items-center justify-center w-[100px] sm:w-[120px] md:w-[140px] mx-auto text-white text-center bg-app-red py-0.5 sm:py-1 px-1 sm:px-2 rounded-full font-bold text-[9px] sm:text-[11px] md:text-xs border-2 border-app-red transition-all duration-200 hover:bg-white hover:text-app-red whitespace-nowrap"
                style={{ minWidth: "100px" }}
              >
                {generalData?.settings.create_account_button}
              </ButtonLink>
              <ButtonLink
                href="/auth/signin"
                className="flex items-center justify-center cursor-pointer"
              >
                <LoginIcon
                  width={18}
                  height={18}
                  className="object-contain"
                  aria-label="Login Button"
                />
              </ButtonLink>

            </>
          )}
          <div className="flex items-center justify-center cursor-pointer w-5 h-5 sm:w-5 sm:h-5"

            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <SearchIcon className=" text-app-red" />
          </div>
        </div>
      </PageLayout>

      {/* Mobile Sliding Menu & Overlay */}
      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isRTL={isRTL}
        generalData={generalData}
        isAuthenticated={isAuthenticated}
        user={user}
        count={count}
      />

      {isSearchOpen && <SearchModal isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />}

      {children}

    </>
  );
}
