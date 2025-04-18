"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type SidebarContextType = {
  open: boolean
  setOpen: (open: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  open: true,
  setOpen: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Initialize with localStorage value if available, otherwise default to true
  const [open, setOpen] = useState<boolean>(true)
  const [mobileOpen, setMobileOpen] = useState<boolean>(false)

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebarOpen")
      if (savedState !== null) {
        setOpen(savedState === "true")
      } else {
        // Default to closed on mobile, open on desktop
        setOpen(window.innerWidth >= 768)
      }
    }
  }, [])

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarOpen", String(open))
    }
  }, [open])

  // Close mobile sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileOpen) {
        setMobileOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [mobileOpen])

  return (
    <SidebarContext.Provider value={{ open, setOpen, mobileOpen, setMobileOpen }}>{children}</SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
