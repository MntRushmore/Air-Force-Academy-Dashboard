"use client"

import type React from "react"

import { useData } from "@/lib/data-context"
import { Loader2 } from "lucide-react"

export function DataLoading({ children }: { children: React.ReactNode }) {
  const { isLoading } = useData()

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading data...</span>
      </div>
    )
  }

  return <>{children}</>
}
