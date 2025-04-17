"use client"

import { useState, useEffect } from "react"
import { Calendar, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveIcsUrl, getIcsUrl, saveScheduleSettings, getScheduleSettings } from "@/lib/schedule-actions"
import { toast } from "@/components/ui/use-toast"

export function ScheduleSettings() {
  const [icsUrl, setIcsUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    showPastEvents: false,
    dayStartHour: "6",
    dayEndHour: "22",
    defaultView: "day",
    categories: [] as string[],
  })

  useEffect(() => {
    async function loadSettings() {
      const savedUrl = await getIcsUrl()
      if (savedUrl) {
        setIcsUrl(savedUrl)
      }

      const savedSettings = await getScheduleSettings()
      if (savedSettings) {
        setSettings(savedSettings)
      }
    }

    loadSettings()
  }, [])

  const handleSaveUrl = async () => {
    if (!icsUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid iCalendar URL",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await saveIcsUrl(icsUrl)
      toast({
        title: "Success",
        description: "Calendar URL saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save calendar URL",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingsChange = async (newSettings: Partial<typeof settings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    await saveScheduleSettings(updatedSettings)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Calendar Settings</CardTitle>
          </div>
          <CardDescription>Configure your iCalendar feed and display options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ics-url">iCalendar URL</Label>
            <Input
              id="ics-url"
              placeholder="https://example.com/calendar.ics"
              value={icsUrl}
              onChange={(e) => setIcsUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Paste your iCalendar URL from Google Calendar, Outlook, or other calendar services
            </p>
          </div>
          <Button onClick={handleSaveUrl} disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Save Calendar URL"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle>Display Options</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-past-events">Show past events</Label>
            <Switch
              id="show-past-events"
              checked={settings.showPastEvents}
              onCheckedChange={(checked) => handleSettingsChange({ showPastEvents: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="day-start">Day starts at</Label>
            <Select
              value={settings.dayStartHour}
              onValueChange={(value) => handleSettingsChange({ dayStartHour: value })}
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
            <Label htmlFor="day-end">Day ends at</Label>
            <Select value={settings.dayEndHour} onValueChange={(value) => handleSettingsChange({ dayEndHour: value })}>
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

          <div className="space-y-2">
            <Label htmlFor="default-view">Default view</Label>
            <Select
              value={settings.defaultView}
              onValueChange={(value) => handleSettingsChange({ defaultView: value })}
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
        </CardContent>
      </Card>
    </>
  )
}
