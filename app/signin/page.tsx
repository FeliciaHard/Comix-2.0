"use client";

import { SigninForm } from "@/components/signin/signin-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SigninPage() {
  const router = useRouter();
  const [appName, setAppName] = useState("comixverse");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.replace("/dashboard");
  }, [router]);

  useEffect(() => {
    const envAppName =
      process.env.NEXT_PUBLIC_APP_NAME || "DefaultAppName";

    setAppName(envAppName);
    localStorage.setItem("appName", envAppName);
  }, []);

  return (
    <>
      {/* LEFT: Branding */}
      <div className="hidden lg:flex flex-col justify-between p-6 text-white">
        <div onClick={() => router.push("/")} className="flex items-center gap-3 cursor-pointer">
          <Image
            src="/favicon.ico"
            alt="logo"
            width={40}
            height={40}
            className="rounded-md"
          />
          <h1 className="text-2xl font-bold tracking-wide uppercase">
            {appName}
          </h1>
        </div>

        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-tight">
            Welcome back
          </h2>
          <p className="text-white/70 mt-4">
            Dive into stories one panel at a time.
          </p>
        </div>

        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} {appName}
        </p>
      </div>

      {/* RIGHT: Login */}
      <div className="flex flex-col items-center justify-center p-6 relative w-full">

        {/* BACK BUTTON (mobile only) */}
        {showForm && (
          <button
            onClick={() => router.push("/")}
            className="lg:hidden absolute top-4 left-4 text-white/70 hover:text-white transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* MOBILE HEADER */}
        <div className="lg:hidden flex flex-col items-center text-center mb-6">
          <Image
            src="/favicon.ico"
            alt="logo"
            width={48}
            height={48}
            className="rounded-md mb-2"
          />

          <h1 className="text-xl font-bold uppercase tracking-wide text-white">
            {appName}
          </h1>
        </div>

        {/* BUTTON (mobile only) */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="
              lg:hidden
              cursor-pointer
              px-6 py-3 rounded-full
              bg-white text-black font-semibold
              transition-transform active:scale-95
            "
          >
            Sign In
          </button>
        )}

        {/* FORM CONTAINER */}
        <div
          className={`
            w-full max-w-md
            transition-all duration-500 ease-in-out
            ${
              showForm
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-10 pointer-events-none lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto"
            }
            lg:block
          `}
        >
          <div className="w-full max-w-md">
            {/* Glass card */}
            <div className="
              backdrop-blur-none
              bg-white/15 border 
              border-white/10 
              rounded-2xl 
              p-8 
              shadow-2xl
            ">
              <div className="mb-6 text-center lg:text-left">
                <h3 className="text-white text-2xl font-semibold">
                  Sign in
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  Access your account
                </p>
              </div>

              <SigninForm />

              {/* close button mobile */}
              <button
                onClick={() => setShowForm(false)}
                className="lg:hidden mt-6 text-sm text-white/60 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}