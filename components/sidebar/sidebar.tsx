"use client";

import * as React from "react";
import Image from "next/image";
import {
  IconArchive,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconFolder,
  IconGenderFemale,
  IconHelp,
  IconLink,
  IconMusic,
  IconReport,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";

import { SideMain } from "@/components/sidebar/side-main";
import { SideUser } from "@/components/sidebar/side-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import modelData from '../../app/model/models.json';

const callModel = modelData.models?.[0];
const modelName = callModel?.bio?.bio_name || "Model";

function capitalizeFirstLetter(word?: string) {
  if (typeof word !== "string" || word.length === 0) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const navData = {
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Musics", url: "/musics", icon: IconMusic },
    { title: "Analytics", url: "#", icon: IconChartBar },
    { title: "Projects", url: "#", icon: IconFolder },
    { title: "Version 2.0", url: "http://192.168.1.240:2405/test-site/auth.php", icon: IconArchive },
    {
      title: "Source Links",
      icon: IconLink,
      items: [
        { title: "TS Progress", url: "https://trello.com/b/vfh3aZai/tracyverse-roadmap-works-in-progress" },
        { title: "Kemono.su", url: "https://kemono.su/patreon/user/313614" },
        { title: "TS-GD", url: "https://drive.google.com/drive/folders/1TgMkfgF5Mxg5Hk2Sj17b2qFPWdCjbPru" },
        { title: "TS-GD-Cover", url: "https://drive.google.com/drive/folders/1S7ed8GV3i5bzqM4ehYJAUUHPCqGSQauf?usp=sharing" },
        { title: "GedeComix", url: "https://gedecomix.com/comics-artist/tracy-scops/" },
      ],
    },
    {
      title: "Stock Hottiest",
      icon: IconGenderFemale,
      items: [
        { title: modelName, url: "/model/0" },
      ],
    },
  ],
  navSecondary: [
    { title: "Settings", url: "#", icon: IconSettings },
    { title: "Get Help", url: "#", icon: IconHelp },
    { title: "Search", url: "#", icon: IconSearch },
  ],
  documents: [
    { name: "Data Library", url: "#", icon: IconDatabase },
    { name: "Reports", url: "#", icon: IconReport },
    { name: "Word Assistant", url: "#", icon: IconFileWord },
  ],
};

export function SideBar({ sideName, ...props }: { sideName: string } & React.ComponentProps<typeof Sidebar>) {
  const cpyAppName = capitalizeFirstLetter(sideName);

  // State for storing user data
  const [user, setUser] = React.useState<{ name: string; profile: string } | null>(null);

  React.useEffect(() => {
    // Retrieve user data and token from localStorage
    const userFromStorage = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    // Log the values to check if they are being retrieved correctly
    // console.log("User from localStorage:", userFromStorage);
    // console.log("Token from localStorage:", token);

    if (userFromStorage && token) {
      try {
        // Parse the user data
        const parsedUser = JSON.parse(userFromStorage);
        setUser(parsedUser); // Set the user state with the data
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="dark:bg-black">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 cursor-pointer rounded-xl"
            >
              <a href="../" className="flex items-center gap-2">
                {/* Replace <img> with <Image /> */}
                <Image src="/favicon.ico" alt="Logo" className="w-5 h-5" width={20} height={20} />
                <span className="text-base font-semibold">{cpyAppName}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="dark:bg-black">
        <SideMain items={navData.navMain} />
      </SidebarContent>

      <SidebarFooter className="dark:bg-black">
        {/* Only show SideUser if user data is available */}
        <SideUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
