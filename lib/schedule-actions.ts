"use server"

import { revalidatePath } from "next/cache"
import { openDB } from "./db"
import { v4 as uuidv4 } from "uuid"
import type { CalendarEvent } from "./types"

// ICS parsing library
import ical from "ical"

export async function saveIcsUrl(url: string) {
  const db = await openDB()

  try {
    // Validate the URL by trying to fetch it
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Invalid iCalendar URL")
    }

    // Save the URL to the database
    await db.put("settings", {
      id: "ics_url",
      value: url,
    })

    revalidatePath("/schedule")
    return true
  } catch (error) {
    console.error("Error saving iCalendar URL:", error)
    throw new Error("Failed to save iCalendar URL")
  }
}

export async function getIcsUrl() {
  const db = await openDB()

  try {
    const setting = await db.get("settings", "ics_url")
    return setting?.value || ""
  } catch (error) {
    console.error("Error getting iCalendar URL:", error)
    return ""
  }
}

export async function saveScheduleSettings(settings: any) {
  const db = await openDB()

  try {
    await db.put("settings", {
      id: "schedule_settings",
      value: settings,
    })

    revalidatePath("/schedule")
    return true
  } catch (error) {
    console.error("Error saving schedule settings:", error)
    throw new Error("Failed to save schedule settings")
  }
}

export async function getScheduleSettings() {
  const db = await openDB()

  try {
    const setting = await db.get("settings", "schedule_settings")
    return (
      setting?.value || {
        showPastEvents: false,
        dayStartHour: "6",
        dayEndHour: "22",
        defaultView: "day",
        categories: [],
      }
    )
  } catch (error) {
    console.error("Error getting schedule settings:", error)
    return {
      showPastEvents: false,
      dayStartHour: "6",
      dayEndHour: "22",
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
            summary: event.summary || "Untitled Event",
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
    throw new Error("Failed to fetch calendar events")
  }
}
