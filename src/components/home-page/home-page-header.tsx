import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import WhatsAppChannelButton from "../ui/whatsapp-channel-button";
import { useHomepageContext } from "@/context/HomepageContext";
import Image from "next/image";

export default function HomePageHeader() {
  const { homepageData } = useHomepageContext();
  const bannerSwiper = homepageData?.bannerSwiper || [];
  const homepageSettings = homepageData?.homepageSettings;

  return (
    <div className="flex flex-col w-full gap-3">
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 1500,
          disableOnInteraction: false,
        }}
        className="w-full"
      >
        {bannerSwiper.map((banner, index) => (
          <SwiperSlide key={index}>
            <section
              className="flex flex-col lg:flex-row relative w-full min-h-[60vh] lg:h-[80vh] overflow-hidden bg-app-off-white dark:bg-app-black"
            >
              <div className="flex flex-col gap-6 md:gap-8 w-full self-center px-4 sm:px-6 md:px-8 lg:px-11 items-start overflow-hidden lg:w-1/2 relative z-10">
                <div className="flex flex-col py-8 md:py-12 lg:py-16">
                  <p className="text-app-black text-[22px] sm:text-[26px] md:text-[32px] font-semibold">
                    {banner.title}
                  </p>
                  <p className="text-app-red text-[20px] sm:text-[24px] md:text-[32px] font-semibold">
                    {banner.subtitle}
                  </p>
                  {banner.description && (
                    <p className="text-app-black text-[14px] sm:text-[16px] md:text-[16px] font-bold mt-2 md:mt-4">
                      {banner.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-full h-full">
                <Image
                  src={banner.full_path.image}
                  alt={banner.title}
                  fill
                  className="object-cover object-center"
                  priority={true}
                />
              </div>
            </section>
          </SwiperSlide>
        ))}
      </Swiper>
      <section className="flex flex-col justify-between items-center px-4 sm:px-6 md:px-8 lg:px-12 py-4 gap-4 text-center lg:flex-row">
        <p className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
          {homepageSettings?.whatsapp_text}
        </p>
        <WhatsAppChannelButton
          href={`https://wa.me/${homepageSettings?.whatsapp_number}`}
          className="w-full sm:w-auto"
        />
      </section>
    </div>
  );
}
