'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import Image from 'next/image';

type Slide = {
  image: string;
  label: string;
};

export default function MaterialYouSlider({ slides = [] }: { slides?: Slide[] }) {
  return (
    <div className="max-w-[1585px] mx-auto py-8 px-4">
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        loop={true}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 300,
          modifier: 1.5,
          slideShadows: true,
        }}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[EffectCoverflow, Pagination, Autoplay]}
        className="mySwiper"
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={index}
            style={{ width: '300px', height: '460px' }}
            className="relative rounded-2xl overflow-hidden shadow-lg group transition-all duration-500"
          >
            {/* Image */}
            {slide.image && (
              <Image
                src={slide.image}
                alt={slide.label}
                width={100}
                height={100}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}

            {/* Gradient Overlay */}
            <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black/70 to-transparent z-10"></div>

            {/* Label */}
            <div className="absolute bottom-0 w-full z-20 text-white text-center py-2 text-lg font-medium backdrop-blur-sm bg-white/10">
              {slide.label}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Global Swiper overrides */}
      <style jsx global>{`
        .mySwiper {
          padding-top: 2px;
          padding-bottom: 40px;
        }

        .mySwiper .swiper-slide {
          transition: transform 0.5s ease, box-shadow 0.3s ease;
        }

        .mySwiper .swiper-slide-active {
          transform: scale(1.05);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
          z-index: 10;
        }

        .mySwiper .swiper-slide-prev,
        .mySwiper .swiper-slide-next {
          transform: scale(0.92);
          opacity: 0.7;
        }

        .mySwiper .swiper-pagination {
          bottom: 5px !important;
        }
      `}</style>
    </div>
  );
}
