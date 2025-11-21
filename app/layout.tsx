import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/provider";

export const metadata: Metadata = {
  title: "Welcome to ComicVerse",
  description: "Dive into a world of stories, one panel at a time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className="bg-white text-black dark:bg-gray-900 dark:text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
