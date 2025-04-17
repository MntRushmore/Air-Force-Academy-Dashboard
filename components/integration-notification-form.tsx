"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react"

export function IntegrationNotificationForm() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real implementation, you would send this to your backend
    console.log("Notification requested for:", email)

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  return (
    <div className="mt-4 max-w-md mx-auto">
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notification-email">Email for notifications</Label>
            <Input
              id="notification-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Notify me when available"}
          </Button>
        </form>
      ) : (
        <div className="flex items-center justify-center space-x-2 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200 p-4 rounded-md">
          <CheckCircle className="h-5 w-5" />
          <p>Thank you! We'll notify you when this feature becomes available.</p>
        </div>
      )}
    </div>
  )
}
