"use client"

import { getSetting, setSetting } from "@/lib/db"
import { z } from "zod"

// Define the schema for calendar settings
const calendarSettingsSchema = z.object({
  dayStartHour: z.number().min(0).max(23).default(7),
  dayEndHour: z.number().min(0).max(23).default(22),
  hidePastEvents: z.boolean().default(false),
  defaultView: z.enum(["day", "week", "agenda"]).default("day"),
})

export type CalendarSettings = z.infer<typeof calendarSettingsSchema>

// Define the schema for calendar events
export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  location?: string
  description?: string
  url?: string
  categories?: string[]
}

// Browser check utility
const isBrowser = typeof window !== "undefined"

// Get calendar settings
export async function getCalendarSettings(): Promise<CalendarSettings> {
  if (!isBrowser) {
    return {
      dayStartHour: 7,
      dayEndHour: 22,
      hidePastEvents: false,
      defaultView: "day",
    }
  }

  try {
    const settings = await getSetting("calendarSettings")
    if (!settings) {
      return {
        dayStartHour: 7,
        dayEndHour: 22,
        hidePastEvents: false,
        defaultView: "day",
      }
    }

    return calendarSettingsSchema.parse(settings)
  } catch (error) {
    console.error("Error getting calendar settings:", error)
    return {
      dayStartHour: 7,
      dayEndHour: 22,
      hidePastEvents: false,
      defaultView: "day",
    }
  }
}

// Save calendar settings
export async function saveCalendarSettings(settings: CalendarSettings): Promise<{ success: boolean; error?: string }> {
  if (!isBrowser) {
    return { success: false, error: "Cannot save settings on the server" }
  }

  try {
    const validatedSettings = calendarSettingsSchema.parse(settings)
    await setSetting("calendarSettings", validatedSettings)
    return { success: true }
  } catch (error) {
    console.error("Error saving calendar settings:", error)
    return { success: false, error: "Failed to save calendar settings" }
  }
}

// Save calendar URL
export async function saveCalendarUrl(url: string): Promise<{ success: boolean; error?: string }> {
  if (!isBrowser) {
    return { success: false, error: "Cannot save URL on the server" }
  }

  try {
    if (!url) {
      return { success: false, error: "URL is required" }
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch (e) {
      return { success: false, error: "Invalid URL format" }
    }

    await setSetting("calendarUrl", url)
    return { success: true }
  } catch (error) {
    console.error("Error saving calendar URL:", error)
    return { success: false, error: "Failed to save calendar URL" }
  }
}

// Fetch calendar events
export async function fetchCalendarEvents(): Promise<{ events: CalendarEvent[]; error?: string }> {
  if (!isBrowser) {
    return { events: [], error: "Cannot fetch events on the server" }
  }

  try {
    const url = await getSetting("calendarUrl")
    if (!url) {
      return { events: [], error: "No calendar URL configured" }
    }

    // Fetch the iCalendar data
    const response = await fetch(`/api/calendar?url=${encodeURIComponent(url)}`)
    if (!response.ok) {
      const errorData = await response.json()
      return { events: [], error: errorData.error || "Failed to fetch calendar data" }
    }

    const data = await response.json()
    return { events: data.events }
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return { events: [], error: "Failed to fetch calendar events" }
  }
}
