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
      <section className="flex bg-app-red py-2 px-4 lg:px-12">
        <div className="flex justify-between items-center w-full">
          <div className="flex rtl:flex-row-reverse gap-2.5 items-center">
            <WhatsappWhiteIcon />
            <div className="text-app-white font-semibold text-[16px]">
              +961 81 708 706
            </div>
          </div>
        </div>
        <div className="flex rtl:flex-row-reverse gap-[15px] items-center">
          <ButtonLink>
            <InstagramWhiteIcon />
          </ButtonLink>
          <ButtonLink>
            <FacebookWhiteIcon />
          </ButtonLink>
          <ButtonLink>
            <TiktokWhiteIcon />
          </ButtonLink>
          <div className="hidden lg:block">
            <LanguageThemeSwitcher />
          </div>
        </div>
      </section>
      {children}
    </>
  );
}
