import React, { PropsWithChildren, useContext, useEffect, useState } from "react";
import PageLayout from "./page-layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useIsMounted } from "@/hooks/use-is-mounted";
import ButtonLink from "./button-link";
import ProfileIcon from "@/assets/icons/profile.icon";
import NavigationMenu from "./navigation-menu";
import ThemeSwitcher from "../general/theme-switcher";
import { useAuth } from "@/context/AuthContext";
import BlurredPrice from "./BlurredPrice";
import Notification from "./notification";
import { useNotificationStore } from "@/store/notification.store";
import { useNotificationCount } from "@/hooks/use-notification-count";
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
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function Header({ children }: PropsWithChildren) {
  const { generalData } = useGlobalContext();
  const { theme } = useAppTheme();
  const isMounted = useIsMounted();
  const { isAuthenticated, user, logout } = useAuth();
  const { count } = useNotificationStore();
  useNotificationCount();
  const { isRTL } = useLanguage();
  const creditsBalance = useCreditsBalance();
  const isCreditsUpdating = useIsCreditsUpdating();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Was `if (!isMounted) return null`, which blanked the ENTIRE header (burger,
  // logo, nav, everything) until hydration on every single page load — a
  // guaranteed layout jump. The only thing that genuinely needs `isMounted` is
  // the light/dark logo swap below (next-themes doesn't know the real theme
  // during SSR); everything else renders immediately.

  return (
    <>
      {/* Main Header */}
      <PageLayout className="sticky top-0 py-1 px-2 sm:px-2 md:px-6 lg:px-8 z-40 sm:py-2  lg:py-3 flex items-center w-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] bg-background-light dark:bg-background-dark">
        {/* Left: Logo and Theme Switcher */}
        <div className="flex items-center justify-between lg:justify-center w-full lg:w-auto">
          {/* Burger Icon for Mobile */}
          <button
            className="lg:hidden p-1 rounded-full hover:bg-app-red/10"
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
            {isMounted && theme === "dark" ? (
              generalData?.settings?.full_path?.dark_mode_logo && (
                <Image src={generalData?.settings?.full_path?.dark_mode_logo} alt="Dark Mode Logo" width={160} height={55} />
              )
            ) : (
              generalData?.settings?.full_path?.logo && (
                <Image src={generalData?.settings?.full_path?.logo} alt="Logo" width={160} height={55} />
              )
            )}
          </ButtonLink>
          <div className="flex items-center gap-1">
            <ThemeSwitcher />

            {/* Mobile-only quick actions: search, balance, profile/login.
                Below `lg` these were previously reachable only by opening the
                burger drawer — this puts the highest-frequency ones (finding
                a product, checking your balance, reaching your account)
                directly on the bar. The full versions still render below,
                `hidden lg:flex`, for desktop. */}
            <div className="flex lg:hidden items-center gap-0.5">
              <button
                type="button"
                className="flex items-center justify-center w-8 h-8 rounded-full text-app-red hover:bg-app-red/10 transition-colors"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Search"
              >
                <SearchIcon className="w-4 h-4 text-app-red" />
              </button>
              {isAuthenticated ? (
                <>
                  {user && (
                    <BlurredPrice
                      price={creditsBalance || user.credits_balance || 0}
                      className={`!text-[12px] px-1 ${isCreditsUpdating ? 'opacity-50 transition-opacity' : ''}`}
                    />
                  )}
                  <ButtonLink
                    href="/account-dashboard"
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-app-red group"
                  >
                    <ProfileIcon className="w-4 h-4 text-app-red group-hover:text-white" />
                  </ButtonLink>
                </>
              ) : (
                <ButtonLink
                  href="/auth/signin"
                  className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-app-red/10"
                >
                  <LoginIcon width={16} height={16} className="object-contain" aria-label="Login" />
                </ButtonLink>
              )}
            </div>
          </div>
        </div>

        {/* Center: Navigation Menu (desktop only) */}
        <div className="hidden lg:flex flex-1 justify-center items-center gap-2 lg:gap-8 min-w-0">
          <NavigationMenu />
        </div>


        {/* Right: User Actions or Auth Buttons */}
        <div className="hidden lg:flex items-center  gap-1 sm:gap-2 lg:gap-4 ms-auto flex-nowrap min-w-0 max-w-full overflow-x-auto whitespace-nowrap">
          {isAuthenticated ? (
            <>
              <Notification count={count} />
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
              <button
                type="button"
                onClick={logout}
                aria-label={generalData?.settings.logout_button}
                title={generalData?.settings.logout_button}
                className="group flex items-center justify-center gap-1 sm:gap-2 font-semibold text-[11px] md:text-xs bg-app-red text-white border-2 border-app-red rounded-full px-2 sm:px-3 py-1 transition-all duration-200 hover:bg-white hover:text-app-red whitespace-nowrap min-w-0"
              >
                <span>{generalData?.settings.logout_button}</span>
                <ArrowRightOnRectangleIcon className="w-4 h-4 rtl:rotate-y-180" aria-hidden="true" />
              </button>
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
          <button
            type="button"
            className="flex items-center justify-center w-5 h-5 sm:w-5 sm:h-5 rounded-full hover:bg-app-red/10 transition-colors"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Search"
          >
            <SearchIcon className=" text-app-red" />
          </button>
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
