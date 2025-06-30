import React, { PropsWithChildren, useContext, useState } from "react";
import PageLayout from "./page-layout";
import { LogoIcon } from "@/assets/icons/logo.icon";
import { useAppTheme } from "@/hooks/use-app-theme";
import { LogoWhiteIcon } from "@/assets/icons/logo-white.icon";
import { useIsMounted } from "@/hooks/use-is-mounted";
import ButtonLink from "./button-link";
import ProfileIcon from "@/assets/icons/profile.icon";
import GlobalState from "@/utils/GlobalState";
import { GlobalStateType } from "@/types/globalSettings.type";
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

export default function Header({ children }: PropsWithChildren) {
  const { generalData } = useGlobalContext();
  const { theme } = useAppTheme();
  const isMounted = useIsMounted();
  const { isAuthenticated, user } = useAuth();
  const { count } = useNotificationStore();

  const [isSigninOpen, setIsSigninOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);

  if (!isMounted) return null;

  return (
    <>
      {/* Main Header */}
      <PageLayout className="sticky top-0 py-1 px-1 z-40 sm:py-2 sm:px-4 lg:py-3 lg:px-12 flex items-center w-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] bg-background-light dark:bg-background-dark overflow-x-auto whitespace-nowrap">
        {/* Left: Logo and Theme Switcher */}
        <div className="flex items-center gap-0 min-w-0">
          <ButtonLink
            href="/"
            className="w-[100px] sm:w-[150px] lg:w-[200px] min-w-0"
          >
            {theme === "dark" ? (
              <Image src={generalData?.settings?.full_path?.dark_mode_logo || ""} alt="Dark Mode Logo" width={160} height={55} />
            ) : (
              <Image src={generalData?.settings?.full_path?.logo || ""} alt="Logo" width={160} height={55} />
            )}
          </ButtonLink>
          <div className="w-[20px] h-[12px] sm:w-[26px] sm:h-[15px] md:w-[32px] md:h-[18px] flex items-center">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Center: Navigation Menu (desktop only) */}
        <div className="hidden lg:flex flex-1 justify-center items-center gap-2 lg:gap-8 min-w-0">
          <NavigationMenu />
        </div>

        {/* Right: User Actions or Auth Buttons */}
        <div className="flex items-center  gap-1 sm:gap-2 lg:gap-4 ml-auto flex-nowrap min-w-0 max-w-full overflow-x-auto whitespace-nowrap">
          {isAuthenticated ? (
            <>
              <Notification
                count={count}
                onClick={() => console.log("Open notifications")}
              />
              {user && <BlurredPrice price={50.0} />}
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
                onClick={() => setIsCreateAccountOpen(true)}
              >
                {generalData?.settings.create_account_button}
              </ButtonLink>
              <ButtonLink
                className="flex items-center justify-center w-[55px] sm:w-[70px] md:w-[85px] mx-auto text-app-red text-center bg-white py-0.5 sm:py-1 px-1 sm:px-2 rounded-full font-bold text-[9px] sm:text-[11px] md:text-xs border-2 border-app-red transition-all duration-200 hover:bg-app-red hover:text-white whitespace-nowrap truncate"
                onClick={() => setIsSigninOpen(true)}
              >
                {generalData?.settings.login_button}
              </ButtonLink>
            </>
          )}
        </div>
      </PageLayout>

      {/* Mobile/Tablet Navigation Banner */}
      <div className="flex items-center justify-center py-2 px-1 sm:px-4 overflow-x-auto flex-nowrap lg:hidden">
        <div className="flex items-center gap-1 overflow-y-hidden sm:gap-2 flex-nowrap justify-center w-full overflow-x-auto whitespace-nowrap">
          <NavigationMenu className="flex-nowrap" isMobile={true} />
        </div>
      </div>

      <SigninModal isOpen={isSigninOpen} setIsOpen={setIsSigninOpen} />
      <CreateAccountModal isOpen={isCreateAccountOpen} setIsOpen={setIsCreateAccountOpen} />

      {children}

    </>
  );
}
