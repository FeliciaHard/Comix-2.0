import type { Metadata } from "next";
import { Providers } from "@/components/provider";

const appName = process.env.APP_NAME ?? "MyApp";

function capitalizeFirstLetter(word?: string) {
  if (typeof word !== 'string' || word.length === 0) {
    return ""; // Handle undefined, null, or empty string
  }
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export const metadata: Metadata = {
  title: "Sign-In | " + capitalizeFirstLetter(appName),
  description: "Dive into a world of stories, one panel at a time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-white dark:bg-black text-black dark:text-white">
        <div
            className="
                bg-[url('https://feliciahard.github.io/comix-src/images/type3.png')]
                bg-cover sm:bg-center bg-no-repeat bg-brightness-[0.2] grayscale
                lg:bg-none
            "
        >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80" />

            {/* Content sits above the gradient */}
            <div className="relative z-10">
            <Providers>
                {children}
            </Providers>
            </div>
        </div>
    </div>
  );
}
