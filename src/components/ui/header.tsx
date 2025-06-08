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
import { SearchIcon } from "@/assets/icons/search.icon";
import { BurgerIcon } from "@/assets/icons/burger.icon";
import { useAppMobileMenuStore } from "@/store/app-mobile-menu.store";
import { CloseIcon } from "@/assets/icons/close.icon";
import LanguageThemeSwitcher from "../general/language-theme-switcher";
import GlobalState from "@/utils/GlobalState";
import { GlobalStateType } from "@/types/globalSettings.type";
import NavigationMenu from "./navigation-menu";
import ThemeSwitcher from "../general/theme-switcher";
import { useAuth } from '@/context/AuthContext';
import BlurredPrice from './BlurredPrice';

export default function Header({ children }: PropsWithChildren) {
  const t = useTranslations("header");
  const globalState = useContext<GlobalStateType>(GlobalState);
  const menuItems = globalState?.generalData?.menu_items;
  const generalData = globalState?.generalData?.settings;
  const { theme } = useAppTheme();
  const isMounted = useIsMounted();
  const { isOpen, toggle } = useAppMobileMenuStore();
  const { isAuthenticated, user } = useAuth();

  if (!isMounted) return null;

  return (
    <>
      <PageLayout className="sticky top-0 py-3 px-4 lg:px-12 flex justify-between items-center w-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] z-10">
        <div className="flex items-center gap-4">
          <ButtonLink href="/">
            {theme === "dark" ? <LogoWhiteIcon /> : <LogoIcon />}
          </ButtonLink>
          <ThemeSwitcher />
        </div>

        <NavigationMenu items={menuItems} />

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <ButtonLink href="/account-dashboard" className="transition-all duration-200 hover:bg-app-red p-2 rounded-full group">
                  <ProfileIcon className="text-app-red group-hover:text-white" />
                </ButtonLink>
                {user && <BlurredPrice price={50.00} />}
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
          <ButtonLink className="block lg:hidden" onClick={toggle}>
            {isOpen ? <CloseIcon /> : <BurgerIcon />}
          </ButtonLink>
        </div>
      </PageLayout>

      {isOpen && (
        <PageLayout className="sticky top-[68px] bg-white dark:bg-app-black z-[5] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] lg:hidden">
          <div className="flex flex-col gap-4 px-4 py-4">
            {isAuthenticated ? (
              <IconButton href="/account-dashboard" icon={<ProfileIcon />}>
                PROFILE
              </IconButton>
            ) : (
              <ButtonLink
                href="/auth/register"
                className="text-app-white bg-app-red py-2 px-6 text-center rounded-full font-bold text-[16px]"
              >
                SIGN UP
              </ButtonLink>
            )}

            <NavigationMenu items={menuItems} isMobile />
          </div>
          <div className="flex py-2 bg-app-red px-4 justify-end">
            <LanguageThemeSwitcher />
          </div>
        </PageLayout>
      )}
      {children}
    </>
  );
}
