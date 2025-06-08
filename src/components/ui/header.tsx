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
import Notification from './notification';
import Link from "next/link";

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
                <Notification count={0} onClick={() => console.log('Open notifications')} />
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
          <ButtonLink className="block lg:hidden" onClick={toggle}>
            {isOpen ? <CloseIcon /> : <BurgerIcon />}
          </ButtonLink>
        </div>
      </PageLayout>

      {isOpen && (
        <PageLayout className="sticky top-[68px] bg-white dark:bg-app-black z-[5] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] lg:hidden">
          <div className="flex flex-col gap-1 px-2 py-2 min-w-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-0 justify-center">
                <Notification count={0} onClick={() => console.log('Open notifications')} />
                {user && <BlurredPrice price={50.00} />}
                <ButtonLink href="/account-dashboard" className="transition-all duration-200 hover:bg-app-red p-2 rounded-full group">
                  <ProfileIcon className="text-app-red group-hover:text-white" />
                </ButtonLink>
              </div>
            ) : (
              <ButtonLink
                href="/auth/register"
                className="text-app-white bg-app-red py-2 px-6 text-center rounded-full font-bold text-[16px]"
              >
                SIGN UP
              </ButtonLink>
            )}

            {/* Custom horizontal nav for mobile */}
            <div className="flex items-center gap-0 flex-row justify-center w-full overflow-x-auto min-w-0">
              <Link href="/categories" className="cursor-pointer font-semibold text-[16px] sm:text-[14px] max-[375px]:text-[12px] hover:text-app-red flex items-center gap-2 flex-shrink min-w-0">
                <div className="w-6 h-6 sm:w-5 sm:h-5 max-[375px]:w-4 max-[375px]:h-4 flex items-center justify-center flex-shrink-0 min-w-0">
                  {/* Categories SVG */}
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M2.333 2.02H6.5v4.166H2.333V2.019zM.667 7.852v-7.5h7.5v7.5h-7.5zm1.666 3.333H6.5v4.166H2.333v-4.166zM.667 17.019v-7.5h7.5v7.5h-7.5zm15-15H11.5v4.167h4.167V2.019zM9.833.353v7.5h7.5v-7.5h-7.5zM11.5 11.186h4.167v4.166H11.5v-4.166zm-1.667 5.833v-7.5h7.5v7.5h-7.5z" fill="#E73828"></path></svg>
                </div>
                <p className="font-semibold text-[16px] sm:text-[14px] max-[375px]:text-[12px] flex-shrink truncate min-w-0">CATEGORIES</p>
              </Link>
              <Link href="/about-us" className="cursor-pointer font-semibold text-[16px] sm:text-[14px] max-[375px]:text-[12px] hover:text-app-red flex items-center gap-2 flex-shrink min-w-0">
                <div className="w-6 h-6 sm:w-5 sm:h-5 max-[375px]:w-4 max-[375px]:h-4 flex items-center justify-center flex-shrink-0 min-w-0">
                  {/* About Us SVG */}
                  <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.3334 4.43591C12.7492 4.43591 12.189 4.66796 11.776 5.08101C11.3629 5.49406 11.1309 6.05427 11.1309 6.63841C11.1309 7.22255 11.3629 7.78277 11.776 8.19582C12.189 8.60886 12.7492 8.84091 13.3334 8.84091C13.9175 8.84091 14.4777 8.60886 14.8908 8.19582C15.3038 7.78277 15.5359 7.22255 15.5359 6.63841C15.5359 6.05427 15.3038 5.49406 14.8908 5.08101C14.4777 4.66796 13.9175 4.43591 13.3334 4.43591ZM11.9642 6.63841C11.9642 6.27529 12.1084 5.92703 12.3652 5.67027C12.622 5.4135 12.9702 5.26925 13.3334 5.26925C13.6965 5.26925 14.0447 5.4135 14.3015 5.67027C14.5583 5.92703 14.7025 6.27529 14.7025 6.63841C14.7025 7.00154 14.5583 7.34979 14.3015 7.60656C14.0447 7.86333 13.6965 8.00758 13.3334 8.00758C12.9702 8.00758 12.622 7.86333 12.3652 7.60656C12.1084 7.34979 11.9642 7.00154 11.9642 6.63841ZM15.1525 9.26758C15.0212 9.23482 14.8841 9.23297 14.7519 9.26218C14.6197 9.29138 14.4961 9.35086 14.3909 9.43591C14.1659 9.61091 13.7675 9.85258 13.3334 9.85258C13.2229 9.85258 13.1169 9.89648 13.0387 9.97462C12.9606 10.0528 12.9167 10.1587 12.9167 10.2692C12.9167 10.3798 12.9606 10.4857 13.0387 10.5639C13.1169 10.642 13.2229 10.6859 13.3334 10.6859C14.0484 10.6859 14.63 10.3051 14.9025 10.0942C14.9126 10.0847 14.9249 10.0778 14.9384 10.0742H14.9417C15.0534 10.1037 15.1642 10.1365 15.2742 10.1726L15.845 10.3601C16.2834 10.5042 16.6159 10.8551 16.7334 11.2884L16.9692 12.9959C17.0159 13.3317 16.8392 13.5834 16.5859 13.6434C16.3997 13.689 16.1739 13.7334 15.9084 13.7767C15.8543 13.7855 15.8025 13.8048 15.7559 13.8336C15.7093 13.8624 15.6688 13.9 15.6368 13.9445C15.6048 13.9889 15.5818 14.0392 15.5692 14.0925C15.5566 14.1458 15.5546 14.201 15.5634 14.2551C15.5721 14.3091 15.5914 14.3609 15.6202 14.4075C15.649 14.4541 15.6867 14.4946 15.7311 14.5266C15.7755 14.5587 15.8258 14.5817 15.8791 14.5943C15.9324 14.6069 15.9876 14.6088 16.0417 14.6001C16.3261 14.5529 16.5717 14.5042 16.7784 14.4542C17.5242 14.2767 17.8892 13.5626 17.795 12.8817L17.5525 11.1267L17.5467 11.1042C17.4554 10.7474 17.2754 10.4195 17.0233 10.151C16.7713 9.88244 16.4554 9.68204 16.105 9.56841L15.5342 9.38091C15.4081 9.33934 15.2808 9.30155 15.1525 9.26758Z" fill="#E73828"></path><path d="M8.33333 4.64429C7.24583 4.64429 6.3925 5.49929 6.3925 6.51929C6.3925 7.53929 7.24583 8.39429 8.33333 8.39429C9.42083 8.39429 10.2742 7.53929 10.2742 6.51929C10.2742 5.49929 9.42083 4.64429 8.33333 4.64429ZM5.1425 6.51929C5.1425 4.77762 6.58666 3.39429 8.33333 3.39429C10.08 3.39429 11.5242 4.77762 11.5242 6.51929C11.5242 8.26095 10.08 9.64429 8.33333 9.64429C6.58666 9.64429 5.1425 8.26095 5.1425 6.51929ZM6.22583 11.491C6.07416 11.3935 5.95916 11.3876 5.90583 11.4018C5.78639 11.4351 5.6675 11.4707 5.54916 11.5085L4.72833 11.771C4.10333 11.971 3.63833 12.4543 3.47333 13.041L3.13416 15.4276C3.0725 15.8668 3.30666 16.2026 3.6625 16.286C4.56 16.4943 6.07083 16.7276 8.33333 16.7276C10.595 16.7276 12.1067 16.4943 13.0042 16.286C13.36 16.2026 13.5942 15.8668 13.5317 15.4276L13.1933 13.041C13.0283 12.4543 12.5633 11.971 11.9383 11.771L11.1175 11.5085C10.9993 11.4705 10.8804 11.4349 10.7608 11.4018C10.7067 11.3876 10.5925 11.3935 10.4408 11.491C10.0142 11.7676 9.27416 12.1326 8.33333 12.1326C7.3925 12.1326 6.6525 11.7676 6.225 11.491M5.57333 10.1968C6.08333 10.0568 6.5675 10.2243 6.90333 10.4418C7.21166 10.6418 7.715 10.8826 8.3325 10.8826C8.94916 10.8826 9.45333 10.641 9.76166 10.441C10.0975 10.2243 10.5817 10.0568 11.0917 10.1968C11.2278 10.2346 11.3633 10.2748 11.4983 10.3176L12.3183 10.581C13.3458 10.9093 14.1417 11.7251 14.41 12.7585L14.4192 12.7918L14.7692 15.2518C14.9083 16.2351 14.3642 17.2526 13.2858 17.5026C12.2875 17.7343 10.6808 17.9776 8.3325 17.9776C5.98416 17.9776 4.3775 17.7343 3.37833 17.5026C2.3 17.2526 1.75666 16.236 1.89583 15.2518L2.24583 12.7926L2.25416 12.7585C2.52333 11.7251 3.31916 10.9093 4.34583 10.581L5.16666 10.3176C5.30166 10.2748 5.43722 10.2346 5.57333 10.1968Z" fill="#E73828"></path></svg>
                </div>
                <p className="font-semibold text-[16px] sm:text-[14px] max-[375px]:text-[12px] flex-shrink truncate min-w-0">ABOUT US</p>
              </Link>
              <Link href="/contact-us" className="cursor-pointer font-semibold text-[16px] sm:text-[14px] max-[375px]:text-[12px] hover:text-app-red flex items-center gap-2 flex-shrink min-w-0">
                <div className="w-6 h-6 sm:w-5 sm:h-5 max-[375px]:w-4 max-[375px]:h-4 flex items-center justify-center flex-shrink-0 min-w-0">
                  {/* Contact Us SVG */}
                  <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.33331 10.3526V7.85258C1.33331 6.08447 2.03569 4.38878 3.28593 3.13853C4.53618 1.88829 6.23187 1.18591 7.99998 1.18591C9.76809 1.18591 11.4638 1.88829 12.714 3.13853C13.9643 4.38878 14.6666 6.08447 14.6666 7.85258V10.3526M13 14.5192C13 15.9001 10.7616 17.0192 7.99998 17.0192" stroke="#E73828" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"></path><path d="M1.33331 10.3526C1.33331 9.91055 1.50891 9.48663 1.82147 9.17407C2.13403 8.86151 2.55795 8.68591 2.99998 8.68591H3.83331C4.27534 8.68591 4.69926 8.86151 5.01182 9.17407C5.32438 9.48663 5.49998 9.91055 5.49998 10.3526V12.8526C5.49998 13.2946 5.32438 13.7185 5.01182 14.0311C4.69926 14.3437 4.27534 14.5192 3.83331 14.5192H2.99998C2.55795 14.5192 2.13403 14.3437 1.82147 14.0311C1.50891 13.7185 1.33331 13.2946 1.33331 12.8526V10.3526ZM10.5 10.3526C10.5 9.91055 10.6756 9.48663 10.9881 9.17407C11.3007 8.86151 11.7246 8.68591 12.1666 8.68591H13C13.442 8.68591 13.8659 8.86151 14.1785 9.17407C14.4911 9.48663 14.6666 9.91055 14.6666 10.3526V12.8526C14.6666 13.2946 14.4911 13.7185 14.1785 14.0311C13.8659 14.3437 13.442 14.5192 13 14.5192H12.1666C11.7246 14.5192 11.3007 14.3437 10.9881 14.0311C10.6756 13.7185 10.5 13.2946 10.5 12.8526ZM" stroke="#E73828" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </div>
                <p className="font-semibold text-[16px] sm:text-[14px] max-[375px]:text-[12px] flex-shrink truncate min-w-0">CONTACT US</p>
              </Link>
            </div>
          </div>
        </PageLayout>
      )}
      {children}
    </>
  );
}
