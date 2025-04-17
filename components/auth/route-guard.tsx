"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

const publicRoutes = ["/auth/sign-in", "/auth/sign-up"]

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Auth check
    if (!isLoading) {
      if (!user && !publicRoutes.includes(pathname)) {
        // Redirect to login if not authenticated and not on a public route
        router.push("/auth/sign-in")
      } else if (user && publicRoutes.includes(pathname)) {
        // Redirect to dashboard if authenticated and on a public route
        router.push("/")
      }
    }
  }, [user, isLoading, pathname, router])

  // Show loading indicator while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If on a protected route and not authenticated, don't render children
  if (!user && !publicRoutes.includes(pathname)) {
    return null
  }

  return <>{children}</>
}
