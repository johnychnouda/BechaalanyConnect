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
import SigninModal from "../auth/signin-modal";
import CreateAccountModal from "../auth/create-account-modal";
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
  const { isAuthenticated, user, isSigninModalOpen, isCreateAccountModalOpen, setIsSigninModalOpen, setIsCreateAccountModalOpen, refreshUserData, isRefreshing } = useAuth();
  const { count } = useNotificationStore();
  const { isRTL } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isMounted) return null;

  const handleRefreshCredits = async () => {
    await refreshUserData();
  };

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
                  <BlurredPrice price={Number(user.credits_balance)} />
                  <button
                    onClick={handleRefreshCredits}
                    disabled={isRefreshing}
                    className="p-1 rounded-full hover:bg-app-red/10 transition-colors duration-200 disabled:opacity-50"
                    title="Refresh credits balance"
                    aria-label="Refresh credits balance"
                  >
                    <svg
                      className={`w-4 h-4 text-app-red transition-all duration-200 ${isRefreshing ? 'animate-spin' : 'hover:scale-110'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
              )}
              <ButtonLink
                href="/account-dashboard"
                className="transition-all duration-200 hover:bg-app-red p-1 sm:p-2 rounded-full group min-w-0"
              >
                <ProfileIcon className="w-5 h-5 sm:w-6 sm:h-6 text-app-red group-hover:text-white" />
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink
                className="flex items-center justify-center w-[100px] sm:w-[120px] md:w-[140px] mx-auto text-white text-center bg-app-red py-0.5 sm:py-1 px-1 sm:px-2 rounded-full font-bold text-[9px] sm:text-[11px] md:text-xs border-2 border-app-red transition-all duration-200 hover:bg-white hover:text-app-red whitespace-nowrap"
                style={{ minWidth: "100px" }}
                onClick={() => setIsCreateAccountModalOpen(true)}
              >
                {generalData?.settings.create_account_button}
              </ButtonLink>
              <div className="flex items-center justify-center cursor-pointer"
                onClick={() => setIsSigninModalOpen(true)}
              >
                <LoginIcon
                  width={18}
                  height={18}
                  className="object-contain"
                  aria-label="Login Button"
                />
              </div>
              <div className="flex items-center justify-center cursor-pointer w-5 h-5 sm:w-6 sm:h-6"

                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <SearchIcon className=" text-app-red" />
              </div>
            </>
          )}
        </div>
      </PageLayout>

      {/* Mobile Sliding Menu & Overlay */}
      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isRTL={isRTL}
        generalData={generalData}
        setIsSigninOpen={setIsSigninModalOpen}
        setIsCreateAccountOpen={setIsCreateAccountModalOpen}
        isAuthenticated={isAuthenticated}
        user={user}
        count={count}
      />

      <SigninModal isOpen={isSigninModalOpen} setIsOpen={setIsSigninModalOpen} setCreateAccountOpen={setIsCreateAccountModalOpen} />
      <CreateAccountModal isOpen={isCreateAccountModalOpen} setIsOpen={setIsCreateAccountModalOpen} />
      {isSearchOpen && <SearchModal isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />}

      {children}

    </>
  );
}
