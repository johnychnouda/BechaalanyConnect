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
      <PageLayout className="sticky top-0 py-3 px-4 lg:px-12 flex justify-between items-center w-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] z-10 bg-background-light dark:bg-background-dark">
        <div className="flex items-center justify-between w-full lg:justify-start lg:gap-4 lg:w-auto">
          <ButtonLink href="/">
            {theme === "dark" ? <LogoWhiteIcon /> : <LogoIcon />}
          </ButtonLink>
          <div className="block ml-auto lg:ml-0">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4 lg:gap-8">
          <NavigationMenu items={menuItems} />
        </div>

        {/* Desktop User Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Notification count={count} onClick={() => console.log('Open notifications')} />
              {user && <BlurredPrice price={50.00} />}
              <ButtonLink href="/account-dashboard" className="transition-all duration-200 hover:bg-app-red p-2 rounded-full group">
                <ProfileIcon className="text-app-red group-hover:text-white" />
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink
                href="/auth/register"
                className="text-white text-center bg-app-red py-2 px-6 rounded-full font-bold text-[16px] border-2 border-app-red transition-all duration-200 hover:bg-white hover:text-app-red"
              >
                CREATE ACCOUNT
              </ButtonLink>
              <ButtonLink
                href="/auth/login"
                className="text-app-red text-center bg-white py-2 px-6 rounded-full font-bold text-[16px] border-2 border-app-red transition-all duration-200 hover:bg-app-red hover:text-white"
              >
                LOGIN
              </ButtonLink>
              <ButtonLink href="/auth/login" className="transition-all duration-200 hover:bg-app-red p-2 rounded-full group">
                <ProfileIcon className="text-app-red group-hover:text-white" />
              </ButtonLink>
            </>
          )}
        </div>
      </PageLayout>

      {/* Mobile/Tablet Navigation Banner */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between py-3 px-2 sm:px-6 overflow-x-auto flex-nowrap" style={{maxWidth: '100vw'}}>
          <div className="flex items-center gap-1 sm:gap-4 flex-nowrap">
            <NavigationMenu className="flex-nowrap" />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-nowrap">
            <Notification count={count} onClick={() => router.push('/account-dashboard/notifications')} />
            <span className="font-bold text-[13px] sm:text-[16px] text-app-red cursor-pointer">
              <span className="filter blur-[4px]">50.00</span>
              <span className="ml-1">$</span>
            </span>
            <a
              className="cursor-pointer transition-all duration-200 hover:bg-app-red p-1 rounded-full group"
              href="/account-dashboard"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 17 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-app-red group-hover:text-white w-[18px] h-[18px]"
              >
                <path
                  d="M8.5 9.68587C9.42298 9.68587 10.3252 9.41218 11.0927 8.8994C11.8601 8.38662 12.4582 7.65778 12.8114 6.80506C13.1646 5.95234 13.2571 5.01403 13.077 4.10879C12.8969 3.20354 12.4525 2.37202 11.7998 1.71938C11.1472 1.06673 10.3157 0.622274 9.41042 0.44221C8.50518 0.262146 7.56686 0.354561 6.71414 0.70777C5.86142 1.06098 5.13259 1.65912 4.61981 2.42655C4.10703 3.19398 3.83333 4.09623 3.83333 5.01921C3.83333 6.25688 4.325 7.44387 5.20017 8.31904C6.07534 9.19421 7.26232 9.68587 8.5 9.68587ZM8.5 1.68587C9.15927 1.68587 9.80373 1.88137 10.3519 2.24764C10.9001 2.61391 11.3273 3.13451 11.5796 3.7436C11.8319 4.35268 11.8979 5.0229 11.7693 5.66951C11.6407 6.31611 11.3232 6.91005 10.857 7.37623C10.3908 7.8424 9.7969 8.15987 9.1503 8.28849C8.5037 8.41711 7.83347 8.3511 7.22439 8.0988C6.6153 7.84651 6.09471 7.41927 5.72843 6.87111C5.36216 6.32294 5.16667 5.67848 5.16667 5.01921C5.16667 4.13515 5.51786 3.28731 6.14298 2.66218C6.7681 2.03706 7.61594 1.68587 8.5 1.68587Z"
                  fill="currentColor"
                />
                <path
                  d="M16.3337 13.9837C15.3262 12.9947 14.1122 12.207 12.7658 11.6686C11.4194 11.1302 9.96898 10.8525 8.50313 10.8525C7.03727 10.8525 5.58681 11.1302 4.24042 11.6686C2.89404 12.207 1.68001 12.9947 0.672565 13.9837C0.454146 14.2004 0.332839 14.4863 0.333335 14.7831V17.8522C0.333335 18.1617 0.465706 18.4586 0.701328 18.6774C0.93695 18.8963 1.25652 19.0192 1.58974 19.0192H15.4102C15.7434 19.0192 16.063 18.8963 16.2986 18.6774C16.5343 18.4586 16.6666 18.1617 16.6666 17.8522V14.7831C16.6688 14.4871 16.5498 14.2013 16.3337 13.9837ZM15.4102 17.8522H1.58974V14.7773C2.48005 13.9065 3.5518 13.2132 4.73978 12.7393C5.92776 12.2655 7.20711 12.0212 8.49998 12.0212C9.79286 12.0212 11.0722 12.2655 12.2602 12.7393C13.4482 13.2132 14.5199 13.9065 15.4102 14.7773V17.8522Z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {children}
    </>
  );
}
