import React, { PropsWithChildren, useContext } from "react";
import PageLayout from "./page-layout";
import { LogoIcon } from "@/assets/icons/logo.icon";
import { useAppTheme } from "@/hooks/use-app-theme";
import { LogoWhiteIcon } from "@/assets/icons/logo-white.icon";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { IconButton } from "./icon-button";
import { useTranslations } from "next-intl";
import ButtonLink from "./button-link";
import ProfileIcon from "@/assets/icons/profile.icon";
import LanguageThemeSwitcher from "../general/language-theme-switcher";
import GlobalState from "@/utils/GlobalState";
import { GlobalStateType } from "@/types/globalSettings.type";
import NavigationMenu from "./navigation-menu";
import ThemeSwitcher from "../general/theme-switcher";
import { useAuth } from '@/context/AuthContext';
import BlurredPrice from './BlurredPrice';
import Notification from './notification';
import Link from "next/link";
import { useRouter } from "next/router";
import AccountSidebar from '@/components/ui/account-sidebar';
import { useNotificationStore } from '@/store/notification.store';

export default function Header({ children }: PropsWithChildren) {
  const t = useTranslations("header");
  const globalState = useContext<GlobalStateType>(GlobalState);
  const menuItems = globalState?.generalData?.menu_items;
  const generalData = globalState?.generalData?.settings;
  const { theme } = useAppTheme();
  const isMounted = useIsMounted();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const isDashboard = router.pathname.startsWith('/account-dashboard');
  const { count } = useNotificationStore();

  if (!isMounted) return null;

  return (
    <>
      {/* Main Header */}
      <PageLayout className="sticky top-0 py-1 px-1 sm:py-2 sm:px-4 lg:py-3 lg:px-12 flex items-center w-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] z-10 bg-background-light dark:bg-background-dark overflow-x-auto whitespace-nowrap">
        {/* Left: Logo and Theme Switcher */}
        <div className="flex items-center gap-0 min-w-0">
          <ButtonLink href="/" className="w-[100px] sm:w-[150px] lg:w-[200px] min-w-0">
            {theme === "dark" ? 
              <LogoWhiteIcon className="w-[80px] h-[28px] sm:w-[120px] sm:h-[41px] lg:w-[160px] lg:h-[55px]" /> : 
              <LogoIcon className="w-[80px] h-[28px] sm:w-[120px] sm:h-[41px] lg:w-[160px] lg:h-[55px]" />
            }
          </ButtonLink>
          <div className="w-[20px] h-[12px] sm:w-[26px] sm:h-[15px] md:w-[32px] md:h-[18px] flex items-center">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Center: Navigation Menu (desktop only) */}
        <div className="hidden lg:flex flex-1 justify-center items-center gap-2 lg:gap-8 min-w-0">
          <NavigationMenu items={menuItems} />
        </div>

        {/* Right: User Actions or Auth Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 ml-auto flex-nowrap min-w-0 max-w-full overflow-x-auto whitespace-nowrap">
          {isAuthenticated ? (
            <>
              <Notification count={count} onClick={() => console.log('Open notifications')} />
              {user && <BlurredPrice price={50.00} />}
              <ButtonLink href="/account-dashboard" className="transition-all duration-200 hover:bg-app-red p-1 sm:p-2 rounded-full group min-w-0">
                <ProfileIcon className="w-5 h-5 sm:w-6 sm:h-6 text-app-red group-hover:text-white" />
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink
                href="/auth/register"
                className="flex items-center justify-center w-[100px] sm:w-[120px] md:w-[140px] mx-auto text-white text-center bg-app-red py-0.5 sm:py-1 px-1 sm:px-2 rounded-full font-bold text-[9px] sm:text-[11px] md:text-xs border-2 border-app-red transition-all duration-200 hover:bg-white hover:text-app-red whitespace-nowrap"
                style={{minWidth: '100px'}}
              >
                CREATE ACCOUNT
              </ButtonLink>
              <ButtonLink
                href="/auth/login"
                className="flex items-center justify-center w-[55px] sm:w-[70px] md:w-[85px] mx-auto text-app-red text-center bg-white py-0.5 sm:py-1 px-1 sm:px-2 rounded-full font-bold text-[9px] sm:text-[11px] md:text-xs border-2 border-app-red transition-all duration-200 hover:bg-app-red hover:text-white whitespace-nowrap truncate"
                style={{maxWidth: '55px'}}
              >
                LOGIN
              </ButtonLink>
            </>
          )}
        </div>
      </PageLayout>

      {/* Mobile/Tablet Navigation Banner */}
      <div className="lg:hidden">
        <div className="flex items-center justify-center py-2 px-1 sm:px-4 overflow-x-auto flex-nowrap" style={{maxWidth: '100vw'}}>
          <div className="flex items-center gap-1 sm:gap-2 flex-nowrap justify-center w-full overflow-x-auto whitespace-nowrap">
            <NavigationMenu className="flex-nowrap" isMobile={true} />
          </div>
        </div>
      </div>

      {children}
    </>
  );
}
