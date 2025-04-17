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
  Menu,
  MessageSquare,
  Settings,
  Target,
  User,
  BarChart,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { open, setOpen, mobileOpen, setMobileOpen } = useSidebar()

  return (
    <>
      <aside
        className={`fixed top-0 z-40 h-full bg-background border-r shadow-sm transition-transform duration-300 ${
          open ? "w-64" : "w-20"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <ScrollArea className="py-4 flex flex-col h-full">
          <div className="px-3 py-2 text-center">
            <Link href="/" className="font-bold text-lg">
              USAFA Prep
            </Link>
          </div>
          <Separator />
          <div className="flex-1">
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
                      } ${open ? "pl-8" : "pl-2 justify-center"}`}
                      asChild
                    >
                      <Link href={item.href} onClick={() => setMobileOpen(false)}>
                        <div className="flex items-center">
                          <item.icon className="h-4 w-4 mr-2" />
                          {open && <span>{item.label}</span>}
                        </div>
                      </Link>
                    </Button>
                  </li>
                )
              })}
            </ul>
          </div>
        </ScrollArea>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2 md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="text-left px-4 pt-4">
            <SheetTitle>USAFA Prep</SheetTitle>
          </SheetHeader>
          <ScrollArea className="py-4">
            <div className="flex-1">
              <ul className="space-y-1">
                {sidebarItems.map((item) => {
                  const isActive =
                    (pathname === "/" && item.href === "/") || (pathname !== "/" && pathname?.startsWith(item.href))

                  return (
                    <li key={item.href}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${isActive ? "bg-accent" : ""} pl-8`}
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
              </ul>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
