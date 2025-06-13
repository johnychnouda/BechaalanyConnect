import React from "react";
import WhatsAppChannelButton from "../ui/whatsapp-channel-button";

export default function HomePageHeader() {
  return (
    <div className="flex flex-col w-full gap-3">
      <section
        className="flex flex-col lg:flex-row relative w-full min-h-[60vh] lg:h-[80vh] overflow-hidden bg-app-off-white dark:bg-app-black"
        style={{
          backgroundImage: "url(/homepage-hero-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col gap-6 md:gap-8 w-full self-center px-4 sm:px-6 md:px-8 lg:px-11 items-start overflow-hidden lg:w-1/2 relative z-10">
          <div className="flex flex-col py-8 md:py-12 lg:py-16">
            <p className="text-app-black text-[22px] sm:text-[26px] md:text-[32px] font-semibold">
              WELCOME TO
            </p>
            <p className="text-app-red text-[20px] sm:text-[24px] md:text-[32px] font-semibold">
              BECHAALANY CONNECT
            </p>
            <p className="text-app-black text-[14px] sm:text-[16px] md:text-[16px] font-bold mt-2 md:mt-4">
              Where speed and reliability meet to deliver the best digital
              solutions.
            </p>
          </div>
        </div>
      </section>
      <section className="flex flex-col justify-between items-center px-4 sm:px-6 md:px-8 lg:px-12 py-4 gap-4 text-center lg:flex-row">
        <p className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
          Join Our WhatsApp Community to Stay Updated with the Latest Offers on
          Our Website!
        </p>
        <WhatsAppChannelButton
          href="https://wa.me/201010000000"
          className="w-full sm:w-auto"
        />
      </section>
    </div>
  );
}
