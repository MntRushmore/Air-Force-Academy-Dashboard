"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  Settings,
  Target,
  User,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <div className="group flex h-screen w-16 flex-col items-center border-r bg-background py-3 transition-all duration-300 hover:w-64 md:w-64">
      <div className="flex h-16 w-full items-center justify-center px-4">
        <GraduationCap className="h-8 w-8 text-primary" />
        <span className="ml-2 hidden text-xl font-bold group-hover:inline-block md:inline-block">USAFA Prep</span>
      </div>
      <div className="flex flex-1 flex-col gap-1 px-2">
        <NavItem href="/" icon={Home} label="Dashboard" isActive={pathname === "/"} />
        <NavItem href="/courses" icon={BookOpen} label="Courses" isActive={pathname === "/courses"} />
        <NavItem href="/grades" icon={FileText} label="Grades" isActive={pathname === "/grades"} />
        <NavItem href="/schedule" icon={Calendar} label="Schedule" isActive={pathname === "/schedule"} />
        <NavItem href="/pomodoro" icon={Clock} label="Pomodoro" isActive={pathname === "/pomodoro"} />
        <NavItem href="/study" icon={LayoutDashboard} label="Study" isActive={pathname === "/study"} />
        <NavItem href="/progress" icon={BarChart} label="Progress" isActive={pathname === "/progress"} />
        <NavItem href="/goals" icon={Target} label="Goals" isActive={pathname === "/goals"} />
        <NavItem href="/mentorship" icon={User} label="Mentorship" isActive={pathname === "/mentorship"} />
        <NavItem href="/journal" icon={FileText} label="Journal" isActive={pathname === "/journal"} />
      </div>
      <div className="mt-auto px-2 pb-4">
        <NavItem href="/settings" icon={Settings} label="Settings" isActive={pathname === "/settings"} />
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  isActive?: boolean
}

function NavItem({ href, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "w-full justify-start",
        isActive ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
      )}
    >
      <Link href={href}>
        <Icon className="h-5 w-5" />
        <span className="ml-2 hidden group-hover:inline-block md:inline-block">{label}</span>
      </Link>
    </Button>
  )
}
