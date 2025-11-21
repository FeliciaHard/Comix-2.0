"use client";

import { SigninForm } from "@/components/signin/signin-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SigninPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // User already logged in, redirect immediately
      router.replace("/dashboard");
    }
  }, [router]);

  const [appName, setAppName] = useState("comixverse");

  useEffect(() => {
    const envAppName = process.env.NEXT_PUBLIC_APP_NAME || "DefaultAppName";
    localStorage.setItem("appName", envAppName);
    setAppName(envAppName);
  }, []);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a
            href="../"
            className="flex items-center gap-2 text-white text-4xl md:text-2xl lg:text-2xl font-bold uppercase"
          >
            <div className="flex size-10 md:size-8 lg:size-8 items-center justify-center">
              <Image
                src="/favicon.ico"
                alt="App logo"
                width={32}
                height={32}
                className="size-10 md:size-8 lg:size-8"
              />
            </div>
            {appName}
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[400px]">
            <SigninForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src={`https://${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/comix-src/images/type3.png`}
          alt="Signin illustration"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
