"use client"

import type React from "react"

import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/sidebar-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Toaster } from "@/components/ui/toaster"
import { db } from "@/lib/db"
import { useSidebar } from "@/components/sidebar-provider"

// Wrapper component to access sidebar context
function MainLayout({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar()

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <main
          className={`flex-1 overflow-x-hidden transition-all duration-300 pt-2 md:pt-4 px-4 md:px-6 pb-8 ${
            open ? "md:ml-64" : "md:ml-20"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize empty database if needed
    const initializeDb = async () => {
      try {
        const courseCount = await db.courses.count()
        if (courseCount === 0) {
          console.log("Database is ready")
        }
      } catch (error) {
        console.error("Error initializing database:", error)
      }
    }

    initializeDb()
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <MainLayout>{children}</MainLayout>
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  )
}
