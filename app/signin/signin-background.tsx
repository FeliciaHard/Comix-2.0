"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useOrientation } from "./useOrientation";

export default function SigninBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bgImage, setBgImage] = useState("");
  const isDesktop = useOrientation();

  useEffect(() => {
    async function loadImage() {
      try {
        const res = await fetch("/signin-images.json");
        const data: {
          landscape: string[];
          portrait: string[];
        } = await res.json();

        const baseUrl = `https://${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/comix-src/`;

        const list = isDesktop ? data.landscape : data.portrait;

        if (list?.length) {
          const random =
            list[Math.floor(Math.random() * list.length)];

          setBgImage(baseUrl + random);
        }
      } catch (err) {
        console.error("Failed to load background:", err);
      }
    }

    loadImage();
  }, [isDesktop]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background image */}
      {bgImage && (
        <Image
          src={bgImage}
          alt="background"
          fill
          priority
          className="object-cover scale-105 dark:brightness-[0.9] dark:grayscale"
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70" />

      {/* Content */}
      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        {children}
      </div>
    </div>
  );
}