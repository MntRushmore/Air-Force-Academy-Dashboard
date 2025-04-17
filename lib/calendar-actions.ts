"use server"

import { revalidatePath } from "next/cache"
import ical from "ical"
import { v4 as uuidv4 } from "uuid"
import { getSetting, setSetting } from "./db"

export interface CalendarEvent {
  id: string
  title: string
  description: string
  location: string
  start: string
  end: string
  allDay: boolean
  categories: string[]
  url?: string
}

export async function fetchCalendarEvents(): Promise<{ events: CalendarEvent[]; error?: string }> {
  try {
    // Get the calendar URL from settings
    const calendarUrl = await getSetting("calendarUrl")

    if (!calendarUrl) {
      return { events: [], error: "No calendar URL configured" }
    }

    // Fetch the iCalendar data
    const response = await fetch(calendarUrl, {
      cache: "no-store", // Ensure we get fresh data
      headers: {
        Accept: "text/calendar",
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch calendar: ${response.status} ${response.statusText}`)
      return {
        events: [],
        error: `Failed to fetch calendar: ${response.status} ${response.statusText}`,
      }
    }

    // Parse the iCalendar data
    const icsData = await response.text()
    const parsedData = ical.parseICS(icsData)

    // Convert to our event format
    const events: CalendarEvent[] = []

    for (const k in parsedData) {
      if (parsedData.hasOwnProperty(k)) {
        const event = parsedData[k]

        if (event.type === "VEVENT") {
          // Skip events without start/end times
          if (!event.start || !event.end) continue

          events.push({
            id: event.uid || uuidv4(),
            title: event.summary || "Untitled Event",
            description: event.description || "",
            location: event.location || "",
            start: event.start.toISOString(),
            end: event.end.toISOString(),
            allDay: event.start.dateOnly === true,
            categories: Array.isArray(event.categories) ? event.categories : event.categories ? [event.categories] : [],
            url: event.url || undefined,
          })
        }
      }
    }

    return { events }
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return {
      events: [],
      error: error instanceof Error ? error.message : "Unknown error fetching calendar events",
    }
  }
}

export async function saveCalendarUrl(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate the URL by trying to fetch it
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        Accept: "text/calendar",
      },
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to validate calendar URL: ${response.status} ${response.statusText}`,
      }
    }

    // Save the URL to settings
    await setSetting("calendarUrl", url)
    revalidatePath("/schedule")

    return { success: true }
  } catch (error) {
    console.error("Error saving calendar URL:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error saving calendar URL",
    }
  }
}

export async function saveCalendarSettings(settings: any): Promise<{ success: boolean; error?: string }> {
  try {
    await setSetting("calendarSettings", settings)
    revalidatePath("/schedule")
    return { success: true }
  } catch (error) {
    console.error("Error saving calendar settings:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error saving settings",
    }
  }
}

export async function getCalendarSettings(): Promise<any> {
  try {
    const settings = await getSetting("calendarSettings")
    return (
      settings || {
        dayStartHour: 7,
        dayEndHour: 22,
        hidePastEvents: false,
        defaultView: "day",
      }
    )
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
