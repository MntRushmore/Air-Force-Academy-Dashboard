"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  Flame,
  GraduationCap,
  Home,
  LineChart,
  PenTool,
  Settings,
  Target,
  Users,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { open, setOpen, mobileOpen, setMobileOpen } = useSidebar()
  const pathname = usePathname()

  const routes = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
    },
    {
      title: "Schedule",
      icon: Calendar,
      href: "/schedule",
    },
    {
      title: "Goals",
      icon: Target,
      href: "/goals",
    },
    {
      title: "Journal",
      icon: PenTool,
      href: "/journal",
    },
    {
      title: "Study",
      icon: BookOpen,
      href: "/study",
    },
    {
      title: "Pomodoro",
      icon: Clock,
      href: "/pomodoro",
    },
    {
      title: "Grades",
      icon: FileText,
      href: "/grades",
    },
    {
      title: "Report Card",
      icon: ClipboardList,
      href: "/report-card",
    },
    {
      title: "Grade Comparison",
      icon: LineChart,
      href: "/grade-comparison",
    },
    {
      title: "Grade Prediction",
      icon: GraduationCap,
      href: "/grade-prediction",
    },
    {
      title: "Fitness",
      icon: Flame,
      href: "/fitness",
    },
    {
      title: "Mentorship",
      icon: Users,
      href: "/mentorship",
    },
    {
      title: "Timeline",
      icon: LineChart,
      href: "/timeline",
    },
    {
      title: "Progress",
      icon: LineChart,
      href: "/progress",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b mt-4">
        <div className="flex items-center justify-between p-2">
          <h2 className="text-lg font-semibold">USAFA Dashboard</h2>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {routes.map((route) => (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton asChild isActive={pathname === route.href} tooltip={route.title}>
                <Link href={route.href}>
                  <route.icon className="h-4 w-4" />
                  <span>{route.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <div className="text-xs text-muted-foreground">USAFA Dashboard v1.0</div>
      </SidebarFooter>
    </Sidebar>
  )
}
