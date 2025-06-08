import React from "react";
import ButtonLink from "../ui/button-link";
import { IconButton } from "../ui/icon-button";
import { WhatsappWhiteIcon } from "@/assets/icons/whatsapp-white.icon";
import Image from "next/image";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useLanguage } from "@/hooks/use-language";
import WhatsAppChannelButton from "../ui/whatsapp-channel-button";
import CategoriesButton from "../ui/categories-button";

export default function HomePageHeader() {
  const { isRTL } = useLanguage();
  const { theme } = useAppTheme();
  const isMounted = useIsMounted();

  return (
    <div className="flex flex-col w-full gap-3">
      <section className="flex flex-col lg:flex-row relative bg-app-off-white  w-full h-[80vh] overflow-hidden dark:bg-app-black">
        {isMounted &&
          (theme === "dark" ? (
            <Image
              src="/homepage-background.png"
              alt="Background Image"
              fill
              className={`pointer-events-none ${isRTL ? "scale-x-[-1]" : ""}`}
            />
          ) : (
            <Image
              src="/homepage-background-light.png"
              alt="Background Image"
              fill
              className={`pointer-events-none ${isRTL ? "scale-x-[-1]" : ""}`}
            />
          ))}
        <div className="flex flex-col gap-8 w-full self-center px-11 items-start overflow-hidden lg:w-1/2">
          <div className="flex flex-col py-16 lg:py-0">
            <p className="text-app-black dark:text-app-white text-[26px] sm:text-[32px] font-semibold">
              WELCOME TO
            </p>
            <p className="text-app-red text-[24px] sm:text-[32px] font-semibold">
              BECHAALANY CONNECT
            </p>
            <p className="text-app-black dark:text-app-white text-[16px] font-bold hidden lg:block">
              Where speed and reliability meet to deliver the best digital solutions.
            </p>
          </div>
          <CategoriesButton href="/categories" className="hidden lg:block" />
        </div>
        <div className="flex relative self-end w-full h-full lg:w-2/3 lg:h-2/3">
          <Image
            src="/homepage-small-image.png"
            alt="Small Image"
            className={`pointer-events-none ${isRTL ? "scale-x-[-1]" : ""}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            quality={100}
          />
        </div>
      </section>
      <section className="flex flex-col justify-between items-center px-12 gap-4 text-center lg:flex-row">
        <p className="font-bold">Join Our WhatsApp Community to Stay Updated with the Latest Offers on Our Website!</p>
        <WhatsAppChannelButton href="https://wa.me/201010000000" />
      </section>
    </div>
  );
}
