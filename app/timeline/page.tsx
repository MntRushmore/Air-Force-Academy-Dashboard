"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Save, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase-client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimelineEvent {
  id: string
  title: string
  description: string
  event_date: string
  category: string
  status: string
  isEditing?: boolean
}

export default function TimelinePage() {
  const { toast } = useToast()
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_date: new Date().toISOString().split("T")[0],
    category: "general",
    status: "upcoming",
  })
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      setLoading(true)
      const { data: user } = await supabase.auth.getUser()

      if (!user.user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to view your timeline",
          variant: "destructive",
        })
        return
      }

      // Fetch from timeline_events table
      const { data, error } = await supabase
        .from("timeline_events")
        .select("*")
        .eq("user_id", user.user.id)
        .order("event_date", { ascending: true })

      if (error) {
        throw error
      }

      setEvents(data)
    } catch (error) {
      console.error("Error fetching timeline events:", error)
      toast({
        title: "Error",
        description: "Failed to load timeline events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleAddEvent() {
    try {
      if (!newEvent.title) {
        toast({
          title: "Validation Error",
          description: "Please enter a title for the event",
          variant: "destructive",
        })
        return
      }

      const { data: user } = await supabase.auth.getUser()

      if (!user.user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to add events",
          variant: "destructive",
        })
        return
      }

      // Get the highest position to add the new event at the end
      const { data: positionData, error: positionError } = await supabase
        .from("timeline_events")
        .select("position")
        .order("position", { ascending: false })
        .limit(1)

      if (positionError) {
        throw positionError
      }

      const position = positionData && positionData.length > 0 ? positionData[0].position + 1 : 1

      // Add to timeline_events table
      const { data, error } = await supabase
        .from("timeline_events")
        .insert([
          {
            user_id: user.user.id,
            title: newEvent.title,
            description: newEvent.description,
            event_date: newEvent.event_date,
            category: newEvent.category,
            status: newEvent.status,
            position: position,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      // Reset the form
      setNewEvent({
        title: "",
        description: "",
        event_date: new Date().toISOString().split("T")[0],
        category: "general",
        status: "upcoming",
      })

      // Refresh events
      fetchEvents()

      toast({
        title: "Success",
        description: "Event added to timeline",
      })
    } catch (error) {
      console.error("Error adding event:", error)
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive",
      })
    }
  }

  async function handleUpdateEvent(event: TimelineEvent) {
    try {
      const { data: user } = await supabase.auth.getUser()

      if (!user.user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to update events",
          variant: "destructive",
        })
        return
      }

      // Update in timeline_events table
      const { error } = await supabase
        .from("timeline_events")
        .update({
          title: event.title,
          description: event.description,
          event_date: event.event_date,
          category: event.category,
          status: event.status,
        })
        .eq("id", event.id)
        .eq("user_id", user.user.id)

      if (error) {
        throw error
      }

      // Update the event in state
      setEvents(events.map((e) => (e.id === event.id ? { ...event, isEditing: false } : e)))

      toast({
        title: "Success",
        description: "Event updated",
      })
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteEvent(id: string) {
    try {
      const { data: user } = await supabase.auth.getUser()

      if (!user.user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to delete events",
          variant: "destructive",
        })
        return
      }

      // Delete from timeline_events table
      const { error } = await supabase.from("timeline_events").delete().eq("id", id).eq("user_id", user.user.id)

      if (error) {
        throw error
      }

      // Remove the event from state
      setEvents(events.filter((e) => e.id !== id))

      toast({
        title: "Success",
        description: "Event deleted",
      })
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      })
    }
  }

  function toggleEditMode(id: string) {
    setEvents(events.map((event) => (event.id === id ? { ...event, isEditing: !event.isEditing } : event)))
  }

  function handleEventChange(id: string, field: keyof TimelineEvent, value: string) {
    setEvents(events.map((event) => (event.id === id ? { ...event, [field]: value } : event)))
  }

  const filteredEvents = activeTab === "all" ? events : events.filter((event) => event.category === activeTab)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "academic":
        return "bg-blue-500"
      case "fitness":
        return "bg-orange-500"
      case "application":
        return "bg-purple-500"
      case "leadership":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>
      case "in_progress":
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">In Progress</span>
      case "upcoming":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Upcoming</span>
      case "scheduled":
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Scheduled</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
          <p className="text-muted-foreground">Track your application milestones and important dates</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Timeline Event</CardTitle>
          <CardDescription>Add important dates, deadlines, and milestones to your timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newEvent.category}
                onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="application">Application</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newEvent.event_date}
                onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newEvent.status} onValueChange={(value) => setNewEvent({ ...newEvent, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Event description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                rows={3}
              />
            </div>
            <Button className="md:col-span-2" onClick={handleAddEvent}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline Events</CardTitle>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="fitness">Fitness</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
              <TabsTrigger value="leadership">Leadership</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No events found. Add your first event above.</div>
          ) : (
            <div className="relative pl-8 border-l">
              {filteredEvents.map((event) => (
                <div key={event.id} className="mb-8 relative">
                  <div className={`absolute -left-10 w-5 h-5 rounded-full ${getCategoryColor(event.category)}`}></div>
                  <div className="absolute -left-[42px] text-xs text-muted-foreground">
                    {new Date(event.event_date).toLocaleDateString()}
                  </div>

                  {event.isEditing ? (
                    <div className="bg-muted p-4 rounded-lg space-y-4">
                      <Input
                        value={event.title}
                        onChange={(e) => handleEventChange(event.id, "title", e.target.value)}
                        className="font-medium text-lg"
                      />
                      <Textarea
                        value={event.description || ""}
                        onChange={(e) => handleEventChange(event.id, "description", e.target.value)}
                        rows={3}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`event-date-${event.id}`}>Date</Label>
                          <Input
                            id={`event-date-${event.id}`}
                            type="date"
                            value={event.event_date}
                            onChange={(e) => handleEventChange(event.id, "event_date", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`event-category-${event.id}`}>Category</Label>
                          <Select
                            value={event.category}
                            onValueChange={(value) => handleEventChange(event.id, "category", value)}
                          >
                            <SelectTrigger id={`event-category-${event.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="academic">Academic</SelectItem>
                              <SelectItem value="fitness">Fitness</SelectItem>
                              <SelectItem value="application">Application</SelectItem>
                              <SelectItem value="leadership">Leadership</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`event-status-${event.id}`}>Status</Label>
                        <Select
                          value={event.status}
                          onValueChange={(value) => handleEventChange(event.id, "status", value)}
                        >
                          <SelectTrigger id={`event-status-${event.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => toggleEditMode(event.id)}>
                          Cancel
                        </Button>
                        <Button onClick={() => handleUpdateEvent(event)}>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg">{event.title}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-muted-foreground mt-1">{event.description}</p>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => toggleEditMode(event.id)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
