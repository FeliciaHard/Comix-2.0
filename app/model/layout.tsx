import type { Metadata } from "next";
import '../styles/dash.css';
// import { Providers } from "@/components/provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SideBar } from "@/components/sidebar/sidebar"
import { NavBar } from "@/components/navbar/navbar"
import { ModeToggle } from '@/components/ui/button-theme';

const appName = process.env.APP_NAME ?? "MyApp";

function capitalizeFirstLetter(word?: string) {
  if (typeof word !== 'string' || word.length === 0) {
    return ""; // Handle undefined, null, or empty string
  }
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export const metadata: Metadata = {
  title: "Model | " + capitalizeFirstLetter(appName),
  description: "Dive into a world of stories, one panel at a time.",
};

const cpyAppName = appName;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="dark:bg-black" defaultOpen={false}>
      <SideBar sideName={cpyAppName} />
      <div className="w-screen">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-50 w-full bg-white dark:bg-black px-4 py-2 shadow-md">
          <div className="flex items-center justify-between">
            <SidebarTrigger className="cursor-pointer p-5" />
            <div className="flex items-center gap-4">
              <NavBar />
              <ModeToggle />
            </div>
          </div>
        </div>

        {/* Page content */}
        {children}
      </div>
    </SidebarProvider>
  )
}
