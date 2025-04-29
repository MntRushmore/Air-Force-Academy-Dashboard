"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  Home,
  LineChart,
  PenTool,
  Settings,
  Target,
  Users,
  Dumbbell,
} from "lucide-react";
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
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { open, setIsOpen, isMobile } = useSidebar();
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
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
      icon: Clock,
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
      label: "Mentorship",
      icon: Users,
      href: "/mentorship",
    },
    {
      label: "Timeline",
      icon: LineChart,
      href: "/timeline",
    },
    {
      label: "Progress",
      icon: LineChart,
      href: "/progress",
    },
    {
      label: "Courses",
      icon: BookOpen,
      href: "/courses",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

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
              <SidebarMenuButton
                isActive={pathname === route.href}
                tooltip={route.label}
              >
                <Link
                  href={route.href}
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <route.icon className="h-4 w-4" />
                  <span>{route.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <div className="text-xs text-muted-foreground">
          USAFA Dashboard v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
}