"use client"

import type React from "react"

import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/sidebar-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Toaster } from "@/components/ui/toaster"
import { useSidebar } from "@/components/sidebar-provider"
import { getClientId } from "@/lib/supabase-client"

// Wrapper component to access sidebar context
function MainLayout({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className={`flex-1 overflow-auto transition-all duration-300 ${open ? "md:ml-64" : "md:ml-16"}`}>
          <div className="container mx-auto p-4 md:p-6 max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize client ID
    getClientId()
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
