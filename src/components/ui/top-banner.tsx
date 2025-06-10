import { WhatsappWhiteIcon } from "@/assets/icons/whatsapp-white.icon";
import React, { PropsWithChildren } from "react";
import ButtonLink from "./button-link";
import { InstagramWhiteIcon } from "@/assets/icons/instagram-white.icon";
import { FacebookWhiteIcon } from "@/assets/icons/facebook-white.icon";
import { TiktokWhiteIcon } from "@/assets/icons/tiktok-white.icon";
import LanguageThemeSwitcher from "../general/language-theme-switcher";

export default function TopBanner({ children }: PropsWithChildren) {
  return (
    <>
      <section className="flex bg-app-red py-1.5 sm:py-2 px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center w-full">
          {/* Phone number section */}
          <div className="flex rtl:flex-row-reverse items-center gap-1 sm:gap-1.5 md:gap-2 py-0.5">
            <div className="flex items-center w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-[18px] md:h-[18px]">
              <WhatsappWhiteIcon />
            </div>
            <div className="flex items-center text-app-white font-semibold text-[11px] sm:text-[13px] md:text-[15px] leading-none h-[15px] sm:h-[17px] md:h-[18px] p-0">
              +961 81 708 706
            </div>
          </div>

          {/* Social icons and language switcher */}
          <div className="flex rtl:flex-row-reverse items-center gap-2 sm:gap-1.5 md:gap-2 py-0.5">
            <ButtonLink href="#" className="hover:opacity-80 transition-opacity flex items-center p-0">
              <div className="flex items-center w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-[18px] md:h-[18px]">
                <InstagramWhiteIcon />
              </div>
            </ButtonLink>
            <ButtonLink href="#" className="hover:opacity-80 transition-opacity flex items-center p-0">
              <div className="flex items-center w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-[18px] md:h-[18px]">
                <FacebookWhiteIcon />
              </div>
            </ButtonLink>
            <ButtonLink href="#" className="hover:opacity-80 transition-opacity flex items-center p-0">
              <div className="flex items-center w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-[18px] md:h-[18px]">
                <TiktokWhiteIcon />
              </div>
            </ButtonLink>
            <div className="flex items-center ml-0.5 sm:ml-1 md:ml-2 h-[15px] sm:h-[17px] md:h-[18px]">
              <LanguageThemeSwitcher />
            </div>
          </div>
        </div>
      </section>
      {children}
    </>
  );
}
