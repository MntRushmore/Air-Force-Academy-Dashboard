"use client"

import { useState, useEffect } from "react"
import { format, parseISO, isToday, isBefore, isAfter, addDays, subDays } from "date-fns"
import { ChevronLeft, ChevronRight, MapPin, Clock, CalendarIcon, Tag, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fetchCalendarEvents, getScheduleSettings } from "@/lib/schedule-actions"
import type { CalendarEvent } from "@/lib/types"

export function ScheduleView() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    showPastEvents: false,
    dayStartHour: "6",
    dayEndHour: "22",
    defaultView: "day",
    categories: [] as string[],
  })
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [activeTab, setActiveTab] = useState("day")

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true)
      setError(null)

      try {
        const savedSettings = await getScheduleSettings()
        if (savedSettings) {
          setSettings(savedSettings)
          setActiveTab(savedSettings.defaultView)
        }

        const calendarEvents = await fetchCalendarEvents()
        setEvents(calendarEvents)
      } catch (error) {
        console.error("Failed to load events:", error)
        setError(
          error instanceof Error ? error.message : "Failed to load calendar events. Please check your iCalendar URL.",
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [])

  useEffect(() => {
    if (events.length > 0) {
      let filtered = [...events]

      // Filter by date based on active tab
      if (activeTab === "day") {
        filtered = filtered.filter((event) => {
          const eventDate = parseISO(event.start)
          return isToday(eventDate) || (isToday(parseISO(event.start)) && isToday(parseISO(event.end)))
        })
      } else if (activeTab === "week") {
        const startOfWeek = subDays(selectedDate, selectedDate.getDay())
        const endOfWeek = addDays(startOfWeek, 6)

        filtered = filtered.filter((event) => {
          const eventDate = parseISO(event.start)
          return isAfter(eventDate, startOfWeek) && isBefore(eventDate, endOfWeek)
        })
      }

      // Apply settings filters
      if (!settings.showPastEvents) {
        filtered = filtered.filter((event) => {
          return isAfter(parseISO(event.end), new Date())
        })
      }

      // Sort by start time
      filtered.sort((a, b) => {
        return parseISO(a.start).getTime() - parseISO(b.start).getTime()
      })

      setFilteredEvents(filtered)
    }
  }, [events, selectedDate, activeTab, settings])

  const navigateDate = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setSelectedDate((prev) => subDays(prev, activeTab === "day" ? 1 : 7))
    } else {
      setSelectedDate((prev) => addDays(prev, activeTab === "day" ? 1 : 7))
    }
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  if (isLoading) {
    return <ScheduleLoadingSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertTitle>Error loading calendar</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (events.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No events found. Please check your iCalendar URL or add events to your calendar.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateDate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="font-medium">{format(selectedDate, "MMMM d, yyyy")}</div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[200px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)] pr-4">
        <TabsContent value="day" className="mt-0">
          <DayView
            events={filteredEvents}
            selectedDate={selectedDate}
            onEventClick={setSelectedEvent}
            settings={settings}
          />
        </TabsContent>
        <TabsContent value="week" className="mt-0">
          <WeekView events={filteredEvents} selectedDate={selectedDate} onEventClick={setSelectedEvent} />
        </TabsContent>
        <TabsContent value="agenda" className="mt-0">
          <AgendaView events={filteredEvents} onEventClick={setSelectedEvent} />
        </TabsContent>
      </ScrollArea>

      <EventDetailsDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  )
}

function DayView({
  events,
  selectedDate,
  onEventClick,
  settings,
}: {
  events: CalendarEvent[]
  selectedDate: Date
  onEventClick: (event: CalendarEvent) => void
  settings: any
}) {
  const dayStartHour = Number.parseInt(settings.dayStartHour)
  const dayEndHour = Number.parseInt(settings.dayEndHour)
  const hoursToDisplay = Array.from({ length: dayEndHour - dayStartHour + 1 }, (_, i) => i + dayStartHour)

  return (
    <div className="space-y-1">
      {hoursToDisplay.map((hour) => {
        const hourEvents = events.filter((event) => {
          const eventHour = parseISO(event.start).getHours()
          return eventHour === hour
        })

        return (
          <div key={hour} className="flex group">
            <div className="w-16 py-2 text-sm text-muted-foreground text-right pr-4">
              {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
            </div>
            <div className="flex-1 border-t border-border group-first:border-t-0 min-h-[60px]">
              {hourEvents.length > 0 ? (
                <div className="space-y-1 py-1">
                  {hourEvents.map((event) => (
                    <EventCard key={event.id} event={event} onClick={() => onEventClick(event)} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function WeekView({
  events,
  selectedDate,
  onEventClick,
}: {
  events: CalendarEvent[]
  selectedDate: Date
  onEventClick: (event: CalendarEvent) => void
}) {
  const startOfWeek = subDays(selectedDate, selectedDate.getDay())
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day.toString()} className="text-center">
            <div className="text-sm font-medium">{format(day, "EEE")}</div>
            <div
              className={`text-sm rounded-full w-8 h-8 flex items-center justify-center mx-auto ${
                isToday(day) ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {weekDays.map((day) => {
          const dayEvents = events.filter((event) => {
            const eventDate = parseISO(event.start)
            return (
              eventDate.getDate() === day.getDate() &&
              eventDate.getMonth() === day.getMonth() &&
              eventDate.getFullYear() === day.getFullYear()
            )
          })

          if (dayEvents.length === 0) return null

          return (
            <div key={day.toString()} className="space-y-1">
              <div className="font-medium text-sm">{format(day, "EEEE, MMMM d")}</div>
              <div className="space-y-1 pl-4">
                {dayEvents.map((event) => (
                  <EventCard key={event.id} event={event} onClick={() => onEventClick(event)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AgendaView({
  events,
  onEventClick,
}: {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}) {
  // Group events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {}

  events.forEach((event) => {
    const dateKey = format(parseISO(event.start), "yyyy-MM-dd")
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = []
    }
    eventsByDate[dateKey].push(event)
  })

  return (
    <div className="space-y-6">
      {Object.entries(eventsByDate).map(([dateKey, dateEvents]) => (
        <div key={dateKey} className="space-y-2">
          <div className="font-medium">{format(parseISO(dateKey), "EEEE, MMMM d")}</div>
          <div className="space-y-2 pl-4">
            {dateEvents.map((event) => (
              <EventCard key={event.id} event={event} onClick={() => onEventClick(event)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EventCard({
  event,
  onClick,
}: {
  event: CalendarEvent
  onClick: () => void
}) {
  const startTime = format(parseISO(event.start), "h:mm a")
  const endTime = format(parseISO(event.end), "h:mm a")
  const isPast = isBefore(parseISO(event.end), new Date())

  return (
    <div
      className={`p-2 rounded-md cursor-pointer transition-colors ${
        isPast ? "bg-muted/50" : "bg-primary/10 hover:bg-primary/20"
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="font-medium truncate">{event.summary}</div>
        {event.categories && event.categories.length > 0 && (
          <Badge variant="outline" className="ml-2 text-xs">
            {event.categories[0]}
          </Badge>
        )}
      </div>
      <div className="text-sm text-muted-foreground flex items-center mt-1">
        <Clock className="h-3 w-3 mr-1" />
        {startTime} - {endTime}
      </div>
      {event.location && (
        <div className="text-sm text-muted-foreground flex items-center mt-1">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="truncate">{event.location}</span>
        </div>
      )}
    </div>
  )
}

function EventDetailsDialog({
  event,
  onClose,
}: {
  event: CalendarEvent | null
  onClose: () => void
}) {
  if (!event) return null

  const startDate = parseISO(event.start)
  const endDate = parseISO(event.end)
  const startTime = format(startDate, "h:mm a")
  const endTime = format(endDate, "h:mm a")
  const formattedDate = format(startDate, "EEEE, MMMM d, yyyy")

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event.summary}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start space-x-3">
            <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium">{formattedDate}</div>
              <div className="text-sm text-muted-foreground">
                {startTime} - {endTime}
              </div>
            </div>
          </div>

          {event.location && (
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Location</div>
                <div className="text-sm">{event.location}</div>
              </div>
            </div>
          )}

          {event.categories && event.categories.length > 0 && (
            <div className="flex items-start space-x-3">
              <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Categories</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {event.categories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {event.description && (
            <div className="pt-2">
              <div className="font-medium mb-1">Description</div>
              <div className="text-sm whitespace-pre-wrap">{event.description}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ScheduleLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-9" />
        </div>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-[200px]" />
      </div>

      <div className="space-y-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex">
              <Skeleton className="w-16 h-6" />
              <div className="flex-1 space-y-2 ml-4">
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
