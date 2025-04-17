"use client"

import { Bell, Menu, Search, Shield, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/sidebar-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { PWAInstaller } from "@/components/pwa-installer"

export function AppHeader() {
  const { open, setOpen, setMobileOpen } = useSidebar()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex mr-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ChevronLeft className={`h-5 w-5 transition-transform ${open ? "" : "rotate-180"}`} />
        </Button>

        <Shield className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg text-primary hidden sm:inline-block">USAFA Prep</span>
      </div>

      <div className="relative flex-1 max-w-md mx-auto md:mx-0 md:ml-6">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="w-full pl-8 pr-4 h-10" />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* PWAInstaller */}
        {(() => {
          try {
            return <PWAInstaller />
          } catch (error) {
            console.error("Failed to render PWAInstaller:", error)
            return null
          }
        })()}
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px] bg-popover border border-border">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span className="font-medium">No new notifications</span>
                <span className="text-xs text-muted-foreground">Check back later for updates</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
