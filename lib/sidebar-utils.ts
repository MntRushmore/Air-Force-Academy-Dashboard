"use client"

import { useEffect } from "react"
import { useSidebar } from "@/components/ui/sidebar"

export function usePersistSidebarState() {
  const { state, setState } = useSidebar()

  useEffect(() => {
    // Load saved state on mount
    const savedState = localStorage.getItem("sidebarState")
    if (savedState === "open" || savedState === "closed") {
      setState(savedState)
    }

    // Save state changes
    const handleStateChange = () => {
      localStorage.setItem("sidebarState", state)
    }

    handleStateChange()

    return () => {
      // Cleanup if needed
    }
  }, [state, setState])

  return { state }
}
