"use server"

import { revalidatePath } from "next/cache"
import { setSetting, getSetting } from "./db"
import { v4 as uuidv4 } from "uuid"
import type { CalendarEvent } from "./types"

// ICS parsing library
import ical from "ical"

export async function saveIcsUrl(url: string) {
  try {
    if (!url) {
      throw new Error("URL is required")
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch (e) {
      throw new Error("Invalid URL format")
    }

    // Validate the URL by trying to fetch it
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Invalid iCalendar URL - Unable to fetch calendar data")
    }

    // Save the URL to the database
    await setSetting("ics_url", url)

    revalidatePath("/schedule")
    return true
  } catch (error) {
    console.error("Error saving iCalendar URL:", error)
    throw error
  }
}

export async function getIcsUrl() {
  try {
    return (await getSetting("ics_url")) || ""
  } catch (error) {
    console.error("Error getting iCalendar URL:", error)
    return ""
  }
}

export async function saveScheduleSettings(settings: any) {
  try {
    await setSetting("schedule_settings", settings)
    revalidatePath("/schedule")
    return { success: true }
  } catch (error) {
    console.error("Error saving schedule settings:", error)
    return { success: false, error: "Failed to save schedule settings" }
  }
}

export async function getScheduleSettings() {
  try {
    const settings = await getSetting("schedule_settings")
    return (
      settings || {
        showPastEvents: false,
        dayStartHour: 6,
        dayEndHour: 22,
        defaultView: "day",
        categories: [],
      }
    )
  } catch (error) {
    console.error("Error getting schedule settings:", error)
    return {
      showPastEvents: false,
      dayStartHour: 6,
      dayEndHour: 22,
      defaultView: "day",
      categories: [],
    }
  }
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const icsUrl = await getIcsUrl()

  if (!icsUrl) {
    return []
  }

  try {
    const response = await fetch(icsUrl, { cache: "no-store" })
    if (!response.ok) {
      throw new Error("Failed to fetch calendar data")
    }

    const icsData = await response.text()
    const parsedData = ical.parseICS(icsData)

    const events: CalendarEvent[] = []

    for (const k in parsedData) {
      if (parsedData.hasOwnProperty(k)) {
        const event = parsedData[k]

        if (event.type === "VEVENT") {
          events.push({
            id: event.uid || uuidv4(),
            title: event.summary || "Untitled Event",
            description: event.description || "",
            location: event.location || "",
            start: event.start?.toISOString() || new Date().toISOString(),
            end: event.end?.toISOString() || new Date().toISOString(),
            categories: event.categories || [],
            status: event.status || "CONFIRMED",
            created: event.created?.toISOString() || new Date().toISOString(),
            lastModified: event.lastModified?.toISOString() || new Date().toISOString(),
          })
        }
      }
    }

    return events
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    throw new Error("Failed to fetch calendar events. Please check your iCalendar URL.")
  }
}
