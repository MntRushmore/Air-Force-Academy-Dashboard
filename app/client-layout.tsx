"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { preloadCriticalResources, handleResourceError } from "@/lib/resource-loader"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Preload critical resources
    preloadCriticalResources()

    // Add global error handler for resource loading
    window.addEventListener(
      "error",
      (event) => {
        // Check if it's a resource loading error
        if (
          event.target instanceof HTMLImageElement ||
          event.target instanceof HTMLScriptElement ||
          event.target instanceof HTMLLinkElement
        ) {
          handleResourceError(event)
          // Prevent the error from propagating
          event.preventDefault()
        }
      },
      true,
    )

    return () => {
      window.removeEventListener("error", handleResourceError, true)
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SidebarProvider>
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <main className="flex-1 p-4 md:p-6">{mounted ? children : null}</main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}
