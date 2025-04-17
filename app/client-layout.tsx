"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/sidebar-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Toaster } from "@/components/ui/toaster"
import { db } from "@/lib/db"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Initialize empty database if needed
    const initializeDb = async () => {
      try {
        const courseCount = await db.courses.count()
        if (courseCount === 0) {
          console.log("Initializing empty database")
        }
      } catch (error) {
        console.error("Error initializing database:", error)
      }
    }

    initializeDb()
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SidebarProvider>
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <main className="flex-1 overflow-x-hidden pt-2 md:pt-4 px-4 md:px-6 pb-8 md:ml-20">{children}</main>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  )
}
