"use client"

import { ChevronRight } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Icon } from "@tabler/icons-react"

export function SideMain({
  items,
}: {
  items: {
    title: string
    url?: string
    icon?: Icon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0
          const isActiveGroup = item.items?.some((sub) => sub.url === pathname)

          return hasSubItems ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive || isActiveGroup}
              className="group/collapsible"
            >
              <SidebarMenuItem className="flex flex-col">
                <CollapsibleTrigger className="cursor-pointer" asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="flex items-center w-full gap-2"
                  >
                    {item.icon && <item.icon className="size-4" />}
                    <span className="truncate">{item.title}</span>
                    <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-4 mt-1">
                    {item.items!.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a
                            href={subItem.url}
                            className={cn(
                              "block w-full text-left truncate text-sm hover:text-primary transition",
                              pathname === subItem.url &&
                                "text-primary font-medium"
                            )}
                          >
                            {subItem.title}
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a
                  href={item.url || "#"}
                  className={cn(
                    "flex items-center gap-2 w-full",
                    pathname === item.url && "text-primary font-medium"
                  )}
                >
                  {item.icon && <item.icon className="size-4" />}
                  <span className="truncate">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
