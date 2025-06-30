import { WhatsappWhiteIcon } from "@/assets/icons/whatsapp-white.icon";
import React, { PropsWithChildren } from "react";
import ButtonLink from "./button-link";
import LanguageThemeSwitcher from "../general/language-theme-switcher";
import { useGlobalContext } from "@/context/GlobalContext";
import Image from "next/image";
import { useLanguage } from "@/hooks/use-language";

export default function TopBanner({ children }: PropsWithChildren) {
  const { generalData } = useGlobalContext();
  const { locale } = useLanguage();

  //remove spacing from whatsapp number
  const whatsappNumber = generalData?.settings.whatsapp_number.replace(/\s/g, '');
  // const displayWhatsappNumber = locale === 'ar' ? formatArabicPhone(generalData?.settings.whatsapp_number || '') : generalData?.settings.whatsapp_number;

  return (
    <>
      <section className="flex bg-app-red py-1.5 sm:py-2 px-4 sm:px-4 md:px-8 lg:px-8">
        <div className="flex justify-between items-center w-full">
          {/* Phone number section */}
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank">
            <div className="flex rtl:flex-row-reverse items-center gap-1 sm:gap-1.5 md:gap-2 py-0.5">

              <div className="flex items-center w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-[18px] md:h-[18px]">
                <WhatsappWhiteIcon />
              </div>
              <div className="flex items-center text-app-white font-semibold text-[11px] sm:text-[13px] md:text-[15px] leading-none h-[15px] sm:h-[17px] md:h-[18px] p-0">
                <span className="flex items-center">
                  {
                    locale === 'ar' ? (
                      <>
                        <span >{whatsappNumber}</span>
                        <span className="mr-0.5">+</span>
                      </>
                    )
                      :
                      (
                        <>
                          <span className="mr-0.5">+</span>
                          <span >{whatsappNumber}</span>
                        </>
                      )
                  }

                </span>
              </div>
            </div>
          </a>

          {/* Social icons and language switcher */}
          <div className="flex rtl:flex-row-reverse items-center gap-2 sm:gap-1.5 md:gap-2 py-0.5">
            {generalData?.social_links.map((social, index) => (
              <ButtonLink target="_blank" href={social.url} key={index} className="hover:opacity-80 transition-opacity flex items-center p-0">
                <div className="flex items-center w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-[18px] md:h-[18px]">
                  <Image src={social.full_path.icon} alt={social.title} width={20} height={20} />
                </div>
              </ButtonLink>
            ))}
            <div className="items-center ml-0.5 sm:ml-1 md:ml-2 h-[15px] sm:h-[17px] md:h-[18px] hidden lg:flex">
              <LanguageThemeSwitcher />
            </div>
          </div>
        </div>
      </section>
      {children}
    </>
  );
}
