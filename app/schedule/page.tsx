"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Calendar, Settings, RefreshCw } from "lucide-react"
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  parseISO,
  isSameDay,
} from "date-fns"
import { getSetting, setSetting } from "@/lib/db"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the CalendarEvent interface
interface CalendarEvent {
  id: string
  title: string
  description: string
  location: string
  start: Date
  end: Date
  allDay: boolean
  categories: string[]
  url?: string
}

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [calendarUrl, setCalendarUrl] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [dayStartHour, setDayStartHour] = useState(7)
  const [dayEndHour, setDayEndHour] = useState(22)
  const [hidePastEvents, setHidePastEvents] = useState(false)
  const [activeView, setActiveView] = useState("day")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  // Load settings and calendar data on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedUrl = (await getSetting("calendarUrl")) || ""
        const savedDayStart = (await getSetting("dayStartHour")) || 7
        const savedDayEnd = (await getSetting("dayEndHour")) || 22
        const savedHidePast = (await getSetting("hidePastEvents")) || false
        const savedView = (await getSetting("defaultView")) || "day"

        setCalendarUrl(savedUrl)
        setDayStartHour(savedDayStart)
        setDayEndHour(savedDayEnd)
        setHidePastEvents(savedHidePast)
        setActiveView(savedView)

        if (savedUrl) {
          fetchCalendarData(savedUrl)
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error("Error loading settings:", err)
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Function to fetch and parse calendar data
  const fetchCalendarData = async (url: string) => {
    setLoading(true)
    setError(null)

    try {
      // In a real implementation, this would be a server action
      // For now, we'll simulate some calendar data
      setTimeout(() => {
        const mockEvents = generateMockEvents(currentDate, 20)
        setEvents(mockEvents)
        setLoading(false)
      }, 1000)
    } catch (err) {
      console.error("Error fetching calendar:", err)
      setError("Failed to fetch calendar data. Please check the URL and try again.")
      setLoading(false)
    }
  }

  // Save calendar URL and settings
  const saveCalendarSettings = async () => {
    try {
      await setSetting("calendarUrl", calendarUrl)
      await setSetting("dayStartHour", dayStartHour)
      await setSetting("dayEndHour", dayEndHour)
      await setSetting("hidePastEvents", hidePastEvents)
      await setSetting("defaultView", activeView)

      if (calendarUrl) {
        fetchCalendarData(calendarUrl)
      }

      setShowSettings(false)
    } catch (err) {
      console.error("Error saving settings:", err)
      setError("Failed to save settings. Please try again.")
    }
  }

  // Navigation functions
  const goToToday = () => setCurrentDate(new Date())
  const goToPrevious = () => {
    if (activeView === "day") {
      setCurrentDate(subDays(currentDate, 1))
    } else if (activeView === "week") {
      setCurrentDate(subDays(currentDate, 7))
    }
  }
  const goToNext = () => {
    if (activeView === "day") {
      setCurrentDate(addDays(currentDate, 1))
    } else if (activeView === "week") {
      setCurrentDate(addDays(currentDate, 7))
    }
  }

  // Filter events for the current view
  const getFilteredEvents = () => {
    if (!events.length) return []

    let filteredEvents = [...events]

    // Apply hide past events filter if enabled
    if (hidePastEvents) {
      const now = new Date()
      filteredEvents = filteredEvents.filter((event) => event.end > now)
    }

    // Filter for day view
    if (activeView === "day") {
      return filteredEvents.filter((event) => isSameDay(event.start, currentDate))
    }

    // Filter for week view
    if (activeView === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })

      return filteredEvents.filter((event) => event.start >= weekStart && event.start <= weekEnd)
    }

    // For agenda view, return all events sorted by date
    return filteredEvents.sort((a, b) => a.start.getTime() - b.start.getTime())
  }

  // Generate time slots for day view
  const getTimeSlots = () => {
    const slots = []
    for (let hour = dayStartHour; hour <= dayEndHour; hour++) {
      slots.push(hour)
    }
    return slots
  }

  // Get days for week view
  const getWeekDays = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }

  // Group events by date for agenda view
  const getGroupedEvents = () => {
    const filteredEvents = getFilteredEvents()
    const grouped: { [key: string]: CalendarEvent[] } = {}

    filteredEvents.forEach((event) => {
      const dateKey = format(event.start, "yyyy-MM-dd")
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, events]) => ({
        date: parseISO(date),
        events,
      }))
  }

  // Render event card
  const renderEventCard = (event: CalendarEvent) => (
    <div
      key={event.id}
      className="p-2 mb-2 rounded-md bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors"
      onClick={() => setSelectedEvent(event)}
    >
      <div className="flex justify-between items-start">
        <div className="font-medium">{event.title}</div>
        <div className="text-xs text-muted-foreground">
          {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
        </div>
      </div>
      {event.location && <div className="text-xs text-muted-foreground mt-1">📍 {event.location}</div>}
    </div>
  )

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Schedule</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" size="sm" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" size="sm" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showSettings ? (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Calendar Settings</CardTitle>
            <CardDescription>Configure your calendar display preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calendar-url">iCalendar URL</Label>
                <Input
                  id="calendar-url"
                  placeholder="https://calendar.google.com/calendar/ical/..."
                  value={calendarUrl}
                  onChange={(e) => setCalendarUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Paste your iCalendar URL from Google Calendar, Outlook, or other calendar services
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day-start">Day Start Hour</Label>
                  <Select
                    value={dayStartHour.toString()}
                    onValueChange={(value) => setDayStartHour(Number.parseInt(value))}
                  >
                    <SelectTrigger id="day-start">
                      <SelectValue placeholder="Select start hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="day-end">Day End Hour</Label>
                  <Select
                    value={dayEndHour.toString()}
                    onValueChange={(value) => setDayEndHour(Number.parseInt(value))}
                  >
                    <SelectTrigger id="day-end">
                      <SelectValue placeholder="Select end hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="hide-past" checked={hidePastEvents} onCheckedChange={setHidePastEvents} />
                <Label htmlFor="hide-past">Hide past events</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-view">Default View</Label>
                <Select value={activeView} onValueChange={setActiveView}>
                  <SelectTrigger id="default-view">
                    <SelectValue placeholder="Select default view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="agenda">Agenda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
                <Button onClick={saveCalendarSettings}>Save Settings</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle>
                {activeView === "day" && format(currentDate, "EEEE, MMMM d, yyyy")}
                {activeView === "week" &&
                  `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "MMMM d")} - ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), "MMMM d, yyyy")}`}
                {activeView === "agenda" && "Upcoming Events"}
              </CardTitle>
              <CardDescription>
                {calendarUrl ? (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Calendar connected</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 px-2"
                      onClick={() => fetchCalendarData(calendarUrl)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <span className="text-yellow-500">No calendar connected. Open settings to add your calendar.</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="agenda">Agenda</TabsTrigger>
                </TabsList>

                <TabsContent value="day" className="mt-4">
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex">
                          <Skeleton className="h-16 w-20 rounded-md" />
                          <Skeleton className="h-16 w-full ml-2 rounded-md" />
                        </div>
                      ))}
                    </div>
                  ) : getFilteredEvents().length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No events scheduled for this day</div>
                  ) : (
                    <div className="space-y-1">
                      {getTimeSlots().map((hour) => {
                        const hourEvents = getFilteredEvents().filter(
                          (event) =>
                            event.start.getHours() === hour ||
                            (event.start.getHours() < hour && event.end.getHours() > hour),
                        )

                        return (
                          <div key={hour} className="flex min-h-[60px]">
                            <div className="w-20 text-sm text-muted-foreground pt-2 pr-4 text-right">
                              {hour === 0
                                ? "12 AM"
                                : hour < 12
                                  ? `${hour} AM`
                                  : hour === 12
                                    ? "12 PM"
                                    : `${hour - 12} PM`}
                            </div>
                            <div className="flex-1 border-t pt-2">
                              {hourEvents.map((event) => renderEventCard(event))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="week" className="mt-4">
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-full rounded-md" />
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <Skeleton key={i} className="h-40 rounded-md" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {getWeekDays().map((day) => (
                          <div
                            key={day.toString()}
                            className={`text-center p-2 rounded-md ${
                              isToday(day) ? "bg-primary text-primary-foreground" : ""
                            }`}
                          >
                            <div className="text-sm font-medium">{format(day, "EEE")}</div>
                            <div className="text-2xl">{format(day, "d")}</div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-2 h-[500px]">
                        {getWeekDays().map((day) => {
                          const dayEvents = getFilteredEvents().filter((event) => isSameDay(event.start, day))

                          return (
                            <div key={day.toString()} className="border rounded-md p-2 overflow-y-auto">
                              {dayEvents.length === 0 ? (
                                <div className="text-center text-xs text-muted-foreground h-full flex items-center justify-center">
                                  No events
                                </div>
                              ) : (
                                <div className="space-y-1">{dayEvents.map((event) => renderEventCard(event))}</div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="agenda" className="mt-4">
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-md" />
                      ))}
                    </div>
                  ) : getGroupedEvents().length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No upcoming events</div>
                  ) : (
                    <div className="space-y-6">
                      {getGroupedEvents().map((group) => (
                        <div key={group.date.toString()}>
                          <h3 className="text-sm font-medium mb-2 sticky top-0 bg-background py-1">
                            {isToday(group.date) ? "Today" : format(group.date, "EEEE, MMMM d, yyyy")}
                          </h3>
                          <div className="space-y-2">{group.events.map((event) => renderEventCard(event))}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {selectedEvent && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedEvent.title}</CardTitle>
                <CardDescription>{format(selectedEvent.start, "EEEE, MMMM d, yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-20 flex-shrink-0 text-muted-foreground">Time:</div>
                    <div>
                      {format(selectedEvent.start, "h:mm a")} - {format(selectedEvent.end, "h:mm a")}
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-start">
                      <div className="w-20 flex-shrink-0 text-muted-foreground">Location:</div>
                      <div>{selectedEvent.location}</div>
                    </div>
                  )}

                  {selectedEvent.description && (
                    <div className="flex items-start">
                      <div className="w-20 flex-shrink-0 text-muted-foreground">Details:</div>
                      <div>{selectedEvent.description}</div>
                    </div>
                  )}

                  {selectedEvent.categories && selectedEvent.categories.length > 0 && (
                    <div className="flex items-start">
                      <div className="w-20 flex-shrink-0 text-muted-foreground">Category:</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedEvent.categories.map((category) => (
                          <span key={category} className="px-2 py-1 bg-primary/10 text-xs rounded-full">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEvent.url && (
                    <div className="flex items-start">
                      <div className="w-20 flex-shrink-0 text-muted-foreground">Link:</div>
                      <a
                        href={selectedEvent.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Open event details
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

// Helper function to generate mock events for demonstration
function generateMockEvents(baseDate: Date, count: number): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const categories = ["Class", "Study", "Meeting", "Exam", "Physical Training", "Social"]
  const locations = ["Fairchild Hall", "Mitchell Hall", "Sijan Hall", "Vandenberg Hall", "Arnold Hall", "Harmon Hall"]

  for (let i = 0; i < count; i++) {
    const dayOffset = Math.floor(Math.random() * 14) - 7 // -7 to +7 days
    const date = addDays(baseDate, dayOffset)
    date.setHours(8 + Math.floor(Math.random() * 12)) // 8 AM to 8 PM
    date.setMinutes(Math.random() > 0.5 ? 0 : 30)

    const durationHours = Math.floor(Math.random() * 3) + 1 // 1 to 3 hours
    const end = new Date(date)
    end.setHours(date.getHours() + durationHours)

    const category = categories[Math.floor(Math.random() * categories.length)]

    events.push({
      id: `event-${i}`,
      title: `${category} - ${i + 1}`,
      description: `This is a sample ${category.toLowerCase()} event for demonstration purposes.`,
      location: locations[Math.floor(Math.random() * locations.length)],
      start: date,
      end: end,
      allDay: false,
      categories: [category],
      url: Math.random() > 0.7 ? "https://example.com/event" : undefined,
    })
  }

  return events
}
