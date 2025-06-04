import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import ButtonLink from "./button-link";
import clsx from "clsx";

type Props<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  label?: string;
  viewMoreHref?: string;
  className?: string;
  slidesPerView?: number;
  spaceBetween?: number;
  autoplay?: boolean;
};
export default function SwiperComponent<T>({
  items,
  renderItem,
  label,
  viewMoreHref,
  className,
  slidesPerView = 4,
  spaceBetween = 20,
  autoplay = true,
}: Props<T>) {
  return (
    <div className={clsx("flex flex-col gap-6", className)}>
      <div className="flex justify-between items-center">
        {label && (
          <p className="text-app-red text-[20px] sm:text-[36px] font-semibold">
            {label.toUpperCase()}
          </p>
        )}
        {viewMoreHref && (
          <ButtonLink
            href={viewMoreHref}
            className="text-app-red font-semibold text-[16px] sm:text-[20px] underline"
          >
            VIEW ALL
          </ButtonLink>
        )}
      </div>
      <div className="relative">
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={spaceBetween}
          slidesPerView={1}
          navigation={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: slidesPerView,
            },
          }}
          autoplay={autoplay ? { delay: 3000, disableOnInteraction: false } : false}
          className="w-full"
        >
          {items.map((item, index) => (
            <SwiperSlide key={index}>{renderItem(item)}</SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
} 