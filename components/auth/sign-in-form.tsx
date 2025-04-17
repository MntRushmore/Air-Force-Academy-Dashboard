"use client"

import { redirect } from "next/navigation"
import { useEffect } from "react"

export function SignInForm() {
  useEffect(() => {
    // Redirect to home page
    redirect("/")
  }, [])

  return null
}
