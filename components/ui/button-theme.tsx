"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button className="px-5 py-5 bg-black text-white rounded-full hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-300 cursor-pointer" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} size="icon">
      <Sun className="h-5 w-5 dark:hidden" />
      <Moon className="h-5 w-5 hidden dark:block" />
    </Button>
  )
}
