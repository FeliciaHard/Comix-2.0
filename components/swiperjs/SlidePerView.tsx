'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

type Slide = {
  id: string;
  image: string;
  label: string;
  isNew?: boolean;
};

export default function SlidePerView({ slides = [] }: { slides?: Slide[] }) {
  return (
    <div className="w-full overflow-x-hidden py-8">
      <div className="mx-auto max-w-screen">
        <Swiper
          slidesPerView={5}
          spaceBetween={20}
          loop
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          modules={[Autoplay]}
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 10 },
            480: { slidesPerView: 2, spaceBetween: 15 },
            640: { slidesPerView: 3, spaceBetween: 15 },
            1024: { slidesPerView: 4, spaceBetween: 20 },
            1280: { slidesPerView: 5, spaceBetween: 20 },
          }}
        >
          {slides.map(({ id, image, label, isNew }, idx) => (  // Assuming you add isNew flag in slide data
            <SwiperSlide key={idx} className="relative">
              {image && (
                <a
                  // href={`http://192.168.1.240:2405/test-site/main/php/dashboard/display-comixs/page/page.php?idCom=${id}`}
                  href={`/comic-page/${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative"
                >
                  <div className="w-full aspect-[0.647] mx-auto overflow-hidden rounded-lg shadow-md relative">
                    <Image
                      src={image}
                      alt={label}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {isNew && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md select-none">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-center font-semibold">
                    {label}
                  </div>
                </a>
              )}
            </SwiperSlide>
          ))}

        </Swiper>
      </div>
    </div>
  );
}
