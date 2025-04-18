"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Calendar, Settings, RefreshCw, AlertCircle } from "lucide-react"
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
  isBefore,
} from "date-fns"
import { getSetting } from "@/lib/db"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchCalendarEvents, saveIcsUrl, saveScheduleSettings, getScheduleSettings } from "@/lib/schedule-actions"
import type { CalendarEvent } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [calendarUrl, setCalendarUrl] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    dayStartHour: 7,
    dayEndHour: 22,
    hidePastEvents: false,
    defaultView: "day",
  })
  const [activeView, setActiveView] = useState("day")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Load settings and calendar data on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedUrl = (await getSetting("ics_url")) || ""
        let savedSettings

        try {
          savedSettings = await getScheduleSettings()
        } catch (settingsError) {
          console.error("Error loading schedule settings:", settingsError)
          savedSettings = {
            dayStartHour: 7,
            dayEndHour: 22,
            hidePastEvents: false,
            defaultView: "day",
            categories: [],
          }
        }

        setCalendarUrl(savedUrl)
        setSettings(savedSettings)
        setActiveView(savedSettings.defaultView)

        await loadCalendarData()
      } catch (err) {
        console.error("Error loading settings:", err)
        setError("Failed to load settings. Please try again.")
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const loadCalendarData = async () => {
    setLoading(true)
    setError(null)

    try {
      const events = await fetchCalendarEvents()
      setEvents(events)
    } catch (err) {
      console.error("Error fetching calendar:", err)
      setError(
        err instanceof Error ? err.message : "Failed to fetch calendar data. Please check the URL and try again.",
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Save calendar URL
  const handleSaveUrl = async () => {
    try {
      setLoading(true)
      await saveIcsUrl(calendarUrl)

      toast({
        title: "Success",
        description: "Calendar URL saved successfully",
      })
      setShowSettings(false)
      await loadCalendarData()
    } catch (err) {
      console.error("Error saving URL:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save calendar URL",
        variant: "destructive",
      })
      setError(err instanceof Error ? err.message : "Failed to save calendar URL")
    } finally {
      setLoading(false)
    }
  }

  // Save calendar settings
  const handleSaveSettings = async () => {
    try {
      const result = await saveScheduleSettings(settings)

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to save settings",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        })
        setShowSettings(false)
        await loadCalendarData()
      }
    } catch (err) {
      console.error("Error saving settings:", err)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    }
  }

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCalendarData()
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
    if (settings.hidePastEvents) {
      const now = new Date()
      filteredEvents = filteredEvents.filter((event) => {
        const endDate = parseISO(event.end)
        return isBefore(now, endDate)
      })
    }

    // Filter for day view
    if (activeView === "day") {
      return filteredEvents.filter((event) => {
        const eventDate = parseISO(event.start)
        return isSameDay(eventDate, currentDate)
      })
    }

    // Filter for week view
    if (activeView === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })

      return filteredEvents.filter((event) => {
        const eventDate = parseISO(event.start)
        return (
          (eventDate >= weekStart && eventDate <= weekEnd) ||
          (parseISO(event.end) >= weekStart && parseISO(event.end) <= weekEnd)
        )
      })
    }

    // For agenda view, return all events sorted by date
    return filteredEvents.sort((a, b) => {
      return parseISO(a.start).getTime() - parseISO(b.start).getTime()
    })
  }

  // Generate time slots for day view
  const getTimeSlots = () => {
    const slots = []
    for (let hour = settings.dayStartHour; hour <= settings.dayEndHour; hour++) {
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
      const dateKey = format(parseISO(event.start), "yyyy-MM-dd")
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
  const renderEventCard = (event: CalendarEvent) => {
    const startDate = parseISO(event.start)
    const endDate = parseISO(event.end)
    const isPast = isBefore(endDate, new Date())

    return (
      <div
        key={event.id}
        className={`p-2 mb-2 rounded-md cursor-pointer transition-colors ${
          isPast ? "bg-muted/50" : "bg-primary/10 hover:bg-primary/20"
        }`}
        onClick={() => setSelectedEvent(event)}
      >
        <div className="flex justify-between items-start">
          <div className="font-medium">{event.title}</div>
          <div className="text-xs text-muted-foreground">
            {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
          </div>
        </div>
        {event.location && <div className="text-xs text-muted-foreground mt-1">📍 {event.location}</div>}
        {event.categories && event.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {event.categories.map((category) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

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
          <Button variant="outline" size="icon" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
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
                    value={settings.dayStartHour.toString()}
                    onValueChange={(value) => setSettings({ ...settings, dayStartHour: Number.parseInt(value) })}
                  >
                    <SelectTrigger id="day-start">
                      <SelectValue placeholder="Select start hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i === 0 ? '12 AM" : i &lt; 12 ? `${i} AM` : i === 12 ? "12 PM' : `${i - 12} PM`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="day-end">Day End Hour</Label>
                  <Select
                    value={settings.dayEndHour.toString()}
                    onValueChange={(value) => setSettings({ ...settings, dayEndHour: Number.parseInt(value) })}
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
                <Switch
                  id="hide-past"
                  checked={settings.hidePastEvents}
                  onCheckedChange={(checked) => setSettings({ ...settings, hidePastEvents: checked })}
                />
                <Label htmlFor="hide-past">Hide past events</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-view">Default View</Label>
                <Select
                  value={settings.defaultView}
                  onValueChange={(value) => setSettings({ ...settings, defaultView: value })}
                >
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
                <Button onClick={handleSaveUrl} disabled={loading}>
                  {loading ? "Saving..." : "Save URL"}
                </Button>
                <Button onClick={handleSaveSettings} disabled={loading}>
                  {loading ? "Saving..." : "Save Settings"}
                </Button>
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
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${refreshing ? "animate-spin" : ""}`} />
                      {refreshing ? "Refreshing..." : "Refresh"}
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
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-1">
                        {getTimeSlots().map((hour) => {
                          const hourEvents = getFilteredEvents().filter((event) => {
                            const eventStart = parseISO(event.start)
                            const eventEnd = parseISO(event.end)
                            return (
                              eventStart.getHours() === hour ||
                              (eventStart.getHours() < hour && eventEnd.getHours() > hour)
                            )
                          })

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
                    </ScrollArea>
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

                      <ScrollArea className="h-[500px]">
                        <div className="grid grid-cols-7 gap-2">
                          {getWeekDays().map((day) => {
                            const dayEvents = getFilteredEvents().filter((event) => {
                              const eventDate = parseISO(event.start)
                              return isSameDay(eventDate, day)
                            })

                            return (
                              <div key={day.toString()} className="border rounded-md p-2 min-h-[500px]">
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
                      </ScrollArea>
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
                    <ScrollArea className="h-[calc(100vh-300px)]">
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
                    </ScrollArea>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {selectedEvent && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedEvent.title}</CardTitle>
                <CardDescription>{format(parseISO(selectedEvent.start), "EEEE, MMMM d, yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-20 flex-shrink-0 text-muted-foreground">Time:</div>
                    <div>
                      {format(parseISO(selectedEvent.start), "h:mm a")} -{" "}
                      {format(parseISO(selectedEvent.end), "h:mm a")}
                      {selectedEvent.allDay && " (All day)"}
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
                      <div className="whitespace-pre-wrap">{selectedEvent.description}</div>
                    </div>
                  )}

                  {selectedEvent.categories && selectedEvent.categories.length > 0 && (
                    <div className="flex items-start">
                      <div className="w-20 flex-shrink-0 text-muted-foreground">Category:</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedEvent.categories.map((category) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
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
