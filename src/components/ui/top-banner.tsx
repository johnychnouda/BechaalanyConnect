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
      <section className="flex bg-app-red py-2 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex justify-between items-center w-full">
          {/* Phone number section */}
          <div className="flex rtl:flex-row-reverse gap-2.5 items-center">
            <div className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]">
              <WhatsappWhiteIcon />
            </div>
            <div className="text-app-white font-semibold text-[14px] sm:text-[16px] whitespace-nowrap">
              +961 81 708 706
            </div>
          </div>

          {/* Social icons and language switcher */}
          <div className="flex rtl:flex-row-reverse gap-2 sm:gap-[15px] items-center">
            <ButtonLink href="#" className="hover:opacity-80 transition-opacity">
              <div className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]">
                <InstagramWhiteIcon />
              </div>
            </ButtonLink>
            <ButtonLink href="#" className="hover:opacity-80 transition-opacity">
              <div className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]">
                <FacebookWhiteIcon />
              </div>
            </ButtonLink>
            <ButtonLink href="#" className="hover:opacity-80 transition-opacity">
              <div className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]">
                <TiktokWhiteIcon />
              </div>
            </ButtonLink>
            <div className="sm:ml-2">
              <LanguageThemeSwitcher />
            </div>
          </div>
        </div>
      </section>
      {children}
    </>
  );
}
