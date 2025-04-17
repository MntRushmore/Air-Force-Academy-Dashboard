"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, FileText, GraduationCap, Home, Menu, Settings, User, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Courses",
    href: "/courses",
    icon: BookOpen,
  },
  {
    title: "Schedule",
    href: "/schedule",
    icon: Calendar,
  },
  {
    title: "Grades",
    href: "/grades",
    icon: GraduationCap,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const pathname = usePathname()

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
    localStorage.setItem("sidebarOpen", String(!isSidebarOpen))
  }

  // Load sidebar state from localStorage on mount
  React.useEffect(() => {
    const savedState = localStorage.getItem("sidebarOpen")
    if (savedState !== null) {
      setIsSidebarOpen(savedState === "true")
    }
  }, [])

  // Check if we're on mobile
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col w-64 border-r bg-background transition-all duration-300 ease-in-out",
          !isSidebarOpen && "md:w-20",
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-5 w-5" />
            {isSidebarOpen && <span>USAFA Dashboard</span>}
          </Link>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={toggleSidebar} aria-label="Toggle sidebar">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-auto p-2">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {isSidebarOpen && <span>{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t p-4">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Cadet Smith</span>
                <span className="text-xs text-muted-foreground">Class of 2025</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-full bg-muted" />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-50" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <GraduationCap className="h-5 w-5" />
              <span>USAFA Dashboard</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 overflow-auto p-2">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Cadet Smith</span>
                <span className="text-xs text-muted-foreground">Class of 2025</span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  )
}
