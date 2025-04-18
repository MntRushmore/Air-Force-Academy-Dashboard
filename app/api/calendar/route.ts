import { type NextRequest, NextResponse } from "next/server"
import ical from "ical"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch (e) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Fetch the iCalendar data
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "text/calendar,application/calendar+xml,text/plain",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch calendar data: ${response.statusText}` },
        { status: response.status },
      )
    }

    const icsData = await response.text()

    // Parse the iCalendar data
    try {
      const parsedData = ical.parseICS(icsData)

      const events = []

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
              url: event.url || "",
              allDay: !event.start?.getHours && !event.start?.getMinutes,
            })
          }
        }
      }

      return NextResponse.json({ events })
    } catch (error) {
      console.error("Error parsing iCalendar data:", error)
      return NextResponse.json(
        { error: "Failed to parse iCalendar data. Please check that the URL points to a valid iCalendar file." },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error processing calendar request:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the calendar data." },
      { status: 500 },
    )
  }
}
