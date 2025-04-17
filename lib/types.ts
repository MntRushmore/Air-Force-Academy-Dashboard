export interface CalendarEvent {
  id: string
  summary: string
  description: string
  location: string
  start: string
  end: string
  categories: string[]
  status: string
  created: string
  lastModified: string
}

export interface ScheduleSettings {
  showPastEvents: boolean
  dayStartHour: string
  dayEndHour: string
  defaultView: string
  categories: string[]
}
