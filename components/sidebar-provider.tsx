"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Flame,
  GraduationCap,
  Home,
  LineChart,
  Menu,
  PenTool,
  Settings,
  Target,
  Users,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ className, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
      variant: "default",
    },
    {
      title: "Schedule",
      icon: Calendar,
      href: "/schedule",
      variant: "ghost",
    },
    {
      title: "Goals",
      icon: Target,
      href: "/goals",
      variant: "ghost",
    },
    {
      title: "Journal",
      icon: PenTool,
      href: "/journal",
      variant: "ghost",
    },
    {
      title: "Study",
      icon: BookOpen,
      href: "/study",
      variant: "ghost",
    },
    {
      title: "Pomodoro",
      icon: Clock,
      href: "/pomodoro",
      variant: "ghost",
    },
    {
      title: "Grades",
      icon: FileText,
      href: "/grades",
      variant: "ghost",
    },
    {
      title: "Report Card",
      icon: ClipboardList,
      href: "/report-card",
      variant: "ghost",
    },
    {
      title: "Grade Comparison",
      icon: LineChart,
      href: "/grade-comparison",
      variant: "ghost",
    },
    {
      title: "Grade Prediction",
      icon: GraduationCap,
      href: "/grade-prediction",
      variant: "ghost",
    },
    {
      title: "Fitness",
      icon: Flame,
      href: "/fitness",
      variant: "ghost",
    },
    {
      title: "Mentorship",
      icon: Users,
      href: "/mentorship",
      variant: "ghost",
    },
    {
      title: "Timeline",
      icon: LineChart,
      href: "/timeline",
      variant: "ghost",
    },
    {
      title: "Progress",
      icon: LineChart,
      href: "/progress",
      variant: "ghost",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
      variant: "ghost",
    },
  ]

  return (
    <div className={cn("relative h-full", className)}>
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-[52px] items-center justify-between px-4 py-2">
          <h2 className={cn("text-lg font-semibold", isCollapsed && "hidden")}>USAFA Dashboard</h2>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
        <ScrollArea className="flex-1 overflow-auto">
          <nav className="grid gap-1 px-2">
            {routes.map((route, i) => (
              <Link
                key={i}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                  pathname === route.href ? "bg-muted font-medium text-primary" : "text-muted-foreground",
                  isCollapsed && "justify-center px-2",
                )}
              >
                <route.icon className={cn("h-5 w-5", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
                {!isCollapsed && <span>{route.title}</span>}
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </div>
  )
}

interface SidebarProviderProps {
  children: React.ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  // Check if we're on mobile
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false

  React.useEffect(() => {
    // Handle resize events to update isMobile state
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }

    // Set initial state
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <div
        className={cn("hidden md:block border-r transition-all duration-300", isCollapsed ? "w-[60px]" : "w-[240px]")}
      >
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Mobile sidebar with Sheet component */}
      <div className="md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed top-4 left-4 z-40">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[240px]">
            <div className="flex justify-between items-center p-4">
              <h2 className="text-lg font-semibold">USAFA Dashboard</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Sidebar isCollapsed={false} setIsCollapsed={() => {}} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 overflow-auto",
          isMobile && "pt-14", // Add padding top on mobile for the menu button
        )}
      >
        {children}
      </div>
    </div>
  )
}
