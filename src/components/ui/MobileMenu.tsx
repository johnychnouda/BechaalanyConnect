import React from "react";
import NavigationMenu from "./navigation-menu";
import ButtonLink from "./button-link";
import LanguageThemeSwitcher from "../general/language-theme-switcher";
import Notification from "./notification";
import BlurredPrice from "./BlurredPrice";
import ProfileIcon from "@/assets/icons/profile.icon";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

interface MobileMenuProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    isRTL: boolean;
    generalData: any;
    setIsSigninOpen: (open: boolean) => void;
    setIsCreateAccountOpen: (open: boolean) => void;
    isAuthenticated: boolean;
    user: any;
    count: number;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isRTL,
    generalData,
    setIsSigninOpen,
    setIsCreateAccountOpen,
    isAuthenticated,
    user,
    count,
}) => {

    const { logout } = useAuth();
    const router = useRouter();


    return (
        <>
            {/* Overlay */}
            <div
                className={`${isMobileMenuOpen ? 'fixed opacity-100' : 'hidden opacity-0'} inset-0 z-50 bg-black transition-opacity duration-300 ${isMobileMenuOpen ? "bg-opacity-40 pointer-events-auto" : "bg-opacity-0 pointer-events-none"}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Sliding Menu */}
            <div className={`${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'} fixed top-0 z-50 h-full w-4/5 max-w-xs bg-background-light dark:bg-background-dark shadow-lg transition-transform duration-300
          ${isRTL ? "right-0" : "left-0"}
          ${isMobileMenuOpen
                    ? "translate-x-0"
                    : isRTL
                        ? "translate-x-full"
                        : "-translate-x-full"
                }
          flex flex-col p-4 gap-4`}>
                {/* Close Button */}
                <button
                    className="self-end mb-2 p-2 rounded focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close menu"
                    type="button"
                >
                    <span className="text-2xl">&times;</span>
                </button>
                {isAuthenticated && (
                    <div className="flex items-center justify-center w-full gap-2">
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
                    </div>
                )
                }
                {/* Navigation Menu */}
                <NavigationMenu isMobile={true} className="flex-col gap-2" />
                {
                    !isAuthenticated ? (
                        <div className="flex flex-col gap-2 mt-4">
                            <ButtonLink
                                className="flex items-center justify-center w-full text-white text-center bg-app-red py-2 px-4 rounded-full font-bold text-xs border-2 border-app-red transition-all duration-200 hover:bg-white hover:text-app-red whitespace-nowrap"
                                onClick={() => {
                                    setIsCreateAccountOpen(true);
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                {generalData?.settings.create_account_button}
                            </ButtonLink>
                            <ButtonLink
                                className="flex items-center justify-center w-full text-app-red text-center bg-white py-2 px-4 rounded-full font-bold text-xs border-2 border-app-red transition-all duration-200 hover:bg-app-red hover:text-white whitespace-nowrap"
                                onClick={() => {
                                    setIsSigninOpen(true);
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                {generalData?.settings.login_button}
                            </ButtonLink>
                        </div>
                    )
                        :
                        (
                            <div className="flex flex-col gap-2 mt-4">
                                <div className=" pt-4 border-t border-[#070707]/20 w-full   flex flex-col items-center">
                                    <button
                                        onClick={() => { logout(); router.push('/'); }}
                                        className="group flex items-center justify-center gap-2 font-['Roboto'] font-semibold text-[13px] bg-[#E73828] text-white border border-[#E73828] rounded-lg px-4 py-2.5 transition-all duration-200 hover:bg-white hover:text-[#E73828] hover:border-[#E73828] shadow-sm"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-4 h-4 text-white" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )
                }

                <div className="flex items-center justify-center w-full  text-center  py-2 px-4  font-bold text-xs whitespace-nowrap">
                    <LanguageThemeSwitcher isMobileMenu={true} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                </div>
            </div>
        </>
    );
};

export default MobileMenu; 