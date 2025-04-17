"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Timer,
  Users,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useSidebar } from "@/components/sidebar-provider"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Timeline",
    href: "/timeline",
    icon: GraduationCap,
  },
  {
    title: "Fitness",
    href: "/fitness",
    icon: Dumbbell,
  },
  {
    title: "Study & Schedule",
    href: "/study",
    icon: Calendar,
  },
  {
    title: "Mentorship",
    href: "/mentorship",
    icon: Users,
  },
  {
    title: "Progress",
    href: "/progress",
    icon: BarChart3,
  },
  {
    title: "Pomodoro",
    href: "/pomodoro",
    icon: Timer,
  },
  {
    title: "Performance",
    href: "/performance",
    icon: Gauge,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { open, setOpen, mobileOpen, setMobileOpen } = useSidebar()

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-20 h-full w-64 border-r bg-background transition-all duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            {open ? (
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-primary p-1">
                  <GraduationCap className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">USAFA Dashboard</span>
              </div>
            ) : (
              <div className="rounded-md bg-primary p-1 mx-auto">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
            )}
          </Link>
          <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setOpen(!open)}>
            {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] pb-10">
          <div className="px-3 py-2">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                    pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    !open && "justify-center",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", !open && "h-6 w-6")} />
                  {open && <span>{item.title}</span>}
                </Link>
              ))}
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-md bg-primary p-1">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">USAFA Dashboard</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-4rem)] pb-10">
            <div className="px-3 py-2">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                      pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
