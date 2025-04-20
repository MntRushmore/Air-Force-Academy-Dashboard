"use client"

import * as React from "react"
import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Dumbbell,
  FileText,
  GraduationCap,
  Home,
  LineChart,
  Menu,
  PenTool,
  Settings,
  Target,
  Timer,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"

// Create a context for sidebar state
type SidebarContextType = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

// Define the routes for navigation
const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/",
  },
  {
    label: "Courses",
    icon: BookOpen,
    href: "/courses",
  },
  {
    label: "Schedule",
    icon: Calendar,
    href: "/schedule",
  },
  {
    label: "Tasks",
    icon: ClipboardList,
    href: "/tasks",
  },
  {
    label: "Goals",
    icon: Target,
    href: "/goals",
  },
  {
    label: "Journal",
    icon: PenTool,
    href: "/journal",
  },
  {
    label: "Study",
    icon: BookOpen,
    href: "/study",
  },
  {
    label: "Pomodoro",
    icon: Timer,
    href: "/pomodoro",
  },
  {
    label: "Grades",
    icon: FileText,
    href: "/grades",
  },
  {
    label: "Report Card",
    icon: ClipboardList,
    href: "/report-card",
  },
  {
    label: "Grade Comparison",
    icon: LineChart,
    href: "/grade-comparison",
  },
  {
    label: "Grade Prediction",
    icon: GraduationCap,
    href: "/grade-prediction",
  },
  {
    label: "Fitness",
    icon: Dumbbell,
    href: "/fitness",
  },
  {
    label: "Timeline",
    icon: Clock,
    href: "/timeline",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
  {
    label: "Mentorship",
    icon: Users,
    href: "/mentorship",
  },
  {
    label: "Progress",
    icon: LineChart,
    href: "/progress",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(true)
  const [isMobile, setIsMobile] = React.useState(false)

  // Check if we're on mobile and set initial state
  React.useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // On mobile, sidebar should be closed by default
      if (mobile) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    // Check on mount
    checkIsMobile()

    // Add resize listener
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [isOpen])

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isMobile }}>
      <div className="flex h-full min-h-screen">
        <Sidebar />
        <main className={cn("flex-1 transition-all duration-300", isOpen && !isMobile ? "md:ml-64" : "ml-0")}>
          {/* Mobile toggle button */}
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-4 z-50 h-9 w-9 md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <div className="container mx-auto p-4 pt-16 md:p-6 md:pt-6">{children}</div>
        </main>
      </div>
    </SidebarContext.Provider>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, setIsOpen, isMobile } = useSidebar()
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  // Create the sidebar content
  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Home className="h-5 w-5" />
          <span className={cn("transition-opacity", !isOpen && !isMobile && "opacity-0")}>USAFA Dashboard</span>
        </Link>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="ml-auto h-8 w-8"
            aria-label={isOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1">
        <nav className="grid gap-1 px-2 py-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                !isOpen && !isMobile && "justify-center px-2",
              )}
              onClick={() => {
                if (isMobile) {
                  setIsOpen(false)
                  setIsSheetOpen(false)
                }
              }}
            >
              <route.icon className="h-5 w-5" />
              {(isOpen || isMobile) && <span>{route.label}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">US</span>
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="text-sm font-medium">USAFA Applicant</span>
              <span className="text-xs text-muted-foreground">applicant@example.com</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // For mobile, we use a Sheet component
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-64">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    )
  }

  // For desktop, we use a fixed sidebar
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-background transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {sidebarContent}
    </aside>
  )
}
