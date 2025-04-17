"use client"

import type { ReactNode } from "react"

// Simplified route guard that doesn't actually guard routes
export function RouteGuard({ children }: { children: ReactNode }) {
  return <>{children}</>
}
