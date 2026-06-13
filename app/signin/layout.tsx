import type { Metadata } from "next";
import { Providers } from "@/components/provider";
import SigninBackground from "./signin-background";

const appName = process.env.APP_NAME ?? "MyApp";

function capitalizeFirstLetter(word?: string) {
  if (typeof word !== "string" || word.length === 0) return "";
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
    <SigninBackground>
      <Providers>{children}</Providers>
    </SigninBackground>
  );
}