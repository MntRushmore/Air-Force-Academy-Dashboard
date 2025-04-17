"use client"

import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { useSidebar } from "@/components/sidebar-provider"
import { useEffect } from "react"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { open, mobileOpen } = useSidebar()

  // Add effect to handle body overflow when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [mobileOpen])

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className={`flex flex-col transition-all duration-300 ${open ? "md:ml-64" : "md:ml-16"}`}>
        <AppHeader />
        <main className="flex-1 container mx-auto py-6 px-4 md:px-6">{children}</main>
      </div>
    </div>
  )
}
