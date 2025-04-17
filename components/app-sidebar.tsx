"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Dumbbell,
  Flame,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Target,
  User,
  BarChart,
  TrendingUp,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSidebar } from "@/components/sidebar-provider"

const sidebarItems = [
  {
    href: "/",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    href: "/courses",
    icon: BookOpen,
    label: "Courses",
  },
  {
    href: "/fitness",
    icon: Dumbbell,
    label: "Fitness",
  },
  {
    href: "/goals",
    icon: Target,
    label: "Goals",
  },
  {
    href: "/timeline",
    icon: Flame,
    label: "Timeline",
  },
  {
    href: "/study",
    icon: BookOpen,
    label: "Study",
  },
  {
    href: "/mentorship",
    icon: User,
    label: "Mentorship",
  },
  {
    href: "/journal",
    icon: MessageSquare,
    label: "Journal",
  },
  {
    href: "/schedule",
    icon: Calendar,
    label: "Schedule",
  },
  {
    href: "/report-card",
    icon: CheckCircle2,
    label: "Report Card",
  },
  {
    href: "/grade-comparison",
    icon: BarChart,
    label: "Grade Analysis",
  },
  {
    href: "/grade-prediction",
    icon: TrendingUp,
    label: "Grade Prediction",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { open, setOpen, mobileOpen, setMobileOpen } = useSidebar()

  return (
    <>
      <aside
        className={`fixed top-0 z-20 h-full bg-background border-r shadow-sm transition-all duration-300 ${
          open ? "w-64" : "w-16"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-center border-b">
            <Link href="/" className={`font-bold ${open ? "text-lg" : "text-xs"}`}>
              {open ? "USAFA Prep" : "USAFA"}
            </Link>
          </div>

          <ScrollArea className="flex-1 pt-2">
            <nav className="px-2">
              <ul className="space-y-1">
                {sidebarItems.map((item) => {
                  const isActive =
                    (pathname === "/" && item.href === "/") || (pathname !== "/" && pathname?.startsWith(item.href))

                  return (
                    <li key={item.href}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${
                          isActive ? "bg-accent" : ""
                        } ${open ? "px-3" : "px-0 justify-center"} h-10`}
                        asChild
                      >
                        <Link href={item.href} onClick={() => setMobileOpen(false)}>
                          <div className="flex items-center">
                            <item.icon className={`h-4 w-4 ${open ? "mr-2" : ""}`} />
                            {open && <span>{item.label}</span>}
                          </div>
                        </Link>
                      </Button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </ScrollArea>

          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className={`w-full ${open ? "justify-between" : "justify-center"}`}
              onClick={() => setOpen(!open)}
            >
              {open && <span>Collapse</span>}
              <ChevronLeft className={`h-4 w-4 transition-transform ${open ? "" : "rotate-180"}`} />
            </Button>
          </div>
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="h-16 flex items-center justify-start px-4 border-b">
            <SheetTitle>USAFA Prep</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <nav className="p-2">
              <ul className="space-y-1">
                {sidebarItems.map((item) => {
                  const isActive =
                    (pathname === "/" && item.href === "/") || (pathname !== "/" && pathname?.startsWith(item.href))

                  return (
                    <li key={item.href}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${isActive ? "bg-accent" : ""} px-3 h-10`}
                        asChild
                      >
                        <Link href={item.href} onClick={() => setMobileOpen(false)}>
                          <div className="flex items-center">
                            <item.icon className="h-4 w-4 mr-2" />
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      </Button>
                    </li>
                  )
                })}

                <li>
                  <Button variant="ghost" className="w-full justify-start px-3 h-10" asChild>
                    <Link href="/settings" onClick={() => setMobileOpen(false)}>
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        <span>Settings</span>
                      </div>
                    </Link>
                  </Button>
                </li>
              </ul>
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
