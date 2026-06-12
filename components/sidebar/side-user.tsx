"use client";

import React from "react";
import {
  // BadgeCheck,
  Bell,
  ChevronsUpDown,
  // CreditCard,
  LogOut,
  // Sparkles,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

type User = {
  id?: string;
  name: string;
  profile: string | null;
  role?: string;
  curr_status?: string;
  subs?: string;
  tier?: string;
  email?: string;
};

export function SideUser({
  user,
}: {
  user: User | null;
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  async function logout() {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });

      // Clear all localStorage
      localStorage.clear();

      // Redirect to signin
      router.push("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  }

  // If user is null or undefined, show a loading spinner or fallback UI
  if (!user) {
    return (
      <div className="flex items-center justify-center py-3">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-black rounded-full"></div>
      </div>
    ); // This is a simple spinner. You could use a more complex one if preferred.
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer" asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage
                  src={user.profile || "/default-profile.jpg"} // Use fallback if profile is null
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium uppercase">{user.name}</span>
                {/* You could add an email or other user data here if available */}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-85 rounded-lg dark:bg-black"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-4 px-2 py-2">
                <Avatar className="h-28 w-28 rounded-full">
                  <AvatarImage
                    src={user.profile || "/default-profile.jpg"}
                    alt={user.name}
                    className="object-cover"
                  />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
            
                <div className="flex-1 space-y-1">
                  <div>
                    <p className="font-semibold text-lg uppercase">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.role || "Employee"}
                    </p>
                  </div>
            
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div>
                      <span className="font-medium">ID:</span>{" "}
                      {user.id || "N/A"}
                    </div>
            
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <span className="text-green-600">{user.curr_status || "Unknown"}</span>
                    </div>
            
                    <div>
                      <span className="font-medium">Subscription:</span>{" "}
                      {user.subs || "N/A"}
                    </div>
            
                    <div>
                      <span className="font-medium">Tier:</span>{" "}
                      {user.tier || "N/A"}
                    </div>
                  </div>
            
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email || "example@gmail.com"}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
