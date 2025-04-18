"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Calendar,
  ClipboardList,
  Clock,
  Home,
  LayoutDashboard,
  Menu,
  Settings,
  TimerIcon,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSidebar } from "@/components/sidebar-provider"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { isOpen, toggle, isMobile } = useSidebar()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Schedule",
      icon: Calendar,
      href: "/schedule",
      active: pathname === "/schedule",
    },
    {
      label: "Tasks",
      icon: ClipboardList,
      href: "/tasks",
      active: pathname === "/tasks",
    },
    {
      label: "Timeline",
      icon: Clock,
      href: "/timeline",
      active: pathname === "/timeline",
    },
    {
      label: "Pomodoro",
      icon: TimerIcon,
      href: "/pomodoro",
      active: pathname === "/pomodoro",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/analytics",
      active: pathname === "/analytics",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
  ]

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Home className="h-5 w-5" />
          <span>USAFA Dashboard</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className="grid gap-1 px-2 py-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  )

  // For mobile, we use a Sheet component
  if (isMobile) {
    return (
      <>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background transition-transform md:flex",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        {sidebarContent}
      </aside>

      {/* Toggle button for desktop */}
      <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 h-9 w-9 hidden md:flex" onClick={toggle}>
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Mobile toggle button */}
      <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 h-9 w-9 md:hidden" onClick={toggle}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Close button when sidebar is open on mobile */}
      <div className="fixed left-0 top-4 z-30 md:hidden">
        <Button
          variant="outline"
          size="icon"
          className={cn("h-9 w-9 rounded-full transition-all", isOpen ? "left-52 opacity-100" : "left-4 opacity-0")}
          onClick={toggle}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>
    </>
  )
}
