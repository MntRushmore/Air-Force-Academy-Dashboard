"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { Plus, CalendarIcon, Clock, Trash2, Edit, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ScheduleEvent } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type EventType = "class" | "exam" | "study" | "other";

type NewEvent = Omit<
  ScheduleEvent,
  "id" | "user_id" | "created_at" | "updated_at"
> & {
  type: EventType;
};

type EventWithOriginalDates = ScheduleEvent & {
  originalStartTime: string;
  originalEndTime: string;
};

export default function SchedulePage() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] =
    useState<EventWithOriginalDates | null>(null);
  const queryClient = useQueryClient();

  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: "",
    description: "",
    date: format(date, "yyyy-MM-dd"),
    start_time: "09:00",
    end_time: "10:00",
    type: "class",
  });

  // Query for fetching events
  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery<EventWithOriginalDates[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      return data.map((event: ScheduleEvent) => ({
        ...event,
        originalStartTime: event.start_time,
        originalEndTime: event.end_time,
        start_time: format(new Date(event.start_time), "HH:mm"),
        end_time: format(new Date(event.end_time), "HH:mm"),
        date: format(new Date(event.start_time), "yyyy-MM-dd"),
      }));
    },
  });

  // Mutation for creating events
  const createEvent = useMutation({
    mutationFn: async (newEvent: NewEvent) => {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create event");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      handleDialogClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating events
  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updateData }: ScheduleEvent) => {
      const response = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updateData }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update event");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      handleDialogClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting events
  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete event");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Event deleted",
        description: "Your event has been deleted successfully.",
      });
    },
  });

  // Update the handleEdit function
  const handleEdit = (event: EventWithOriginalDates) => {
    setSelectedEvent(event);

    try {
      // Use the original timestamps for editing
      const startDate = new Date(event.originalStartTime);
      const endDate = new Date(event.originalEndTime);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date format");
      }

      setNewEvent({
        title: event.title,
        description: event.description || "",
        date: format(startDate, "yyyy-MM-dd"),
        start_time: format(startDate, "HH:mm"),
        end_time: format(endDate, "HH:mm"),
        type: event.type,
      });
      setIsEditMode(true);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error parsing date:", error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      });
    }
  };

  // Update the Dialog component to use isDialogOpen state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDialogClose = () => {
    setNewEvent({
      title: "",
      description: "",
      date: format(date, "yyyy-MM-dd"),
      start_time: "09:00",
      end_time: "10:00",
      type: "class",
    });
    setIsEditMode(false);
    setSelectedEvent(null);
    setIsDialogOpen(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form
      if (!newEvent.title.trim()) {
        toast({
          title: "Error",
          description: "Title is required",
          variant: "destructive",
        });
        return;
      }

      // Create ISO strings from date and time inputs
      const startDateTime = new Date(`${newEvent.date}T${newEvent.start_time}`);
      const endDateTime = new Date(`${newEvent.date}T${newEvent.end_time}`);

      // Validate times
      if (endDateTime.getTime() <= startDateTime.getTime()) {
        toast({
          title: "Error",
          description: "End time must be after start time",
          variant: "destructive",
        });
        return;
      }

      const eventData = {
        ...newEvent,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      };

      if (isEditMode && selectedEvent) {
        await updateEvent.mutateAsync({
          ...selectedEvent,
          ...eventData,
        });
      } else {
        await createEvent.mutateAsync(eventData);
      }
    } catch (error) {
      // Error is handled by mutation error callbacks
      console.error("Error saving event:", error);
    }
  };

  // Handle event deletion
  const handleDelete = async (id: string) => {
    try {
      await deleteEvent.mutateAsync(id);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting your event.",
        variant: "destructive",
      });
    }
  };

  // Get events for the selected date
  const selectedDateStr = format(date, "yyyy-MM-dd");
  const eventsForSelectedDate = events.filter(
    (event: ScheduleEvent) => event.date === selectedDateStr
  );

  // Add loading skeleton component
  function LoadingSkeleton() {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px] mt-2" />
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_300px]">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[100px]" />
              <Skeleton className="h-4 w-[200px] mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[400px]" />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-4 w-[80px]" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Update the loading state in the main component
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Add error handling
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load events. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground">
          Manage your calendar and important dates
        </p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_300px]">
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>View and manage your schedule</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Events for {format(date, "MMMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {eventsForSelectedDate.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No events scheduled for this day.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {eventsForSelectedDate.map(
                        (event: EventWithOriginalDates) => (
                          <div
                            key={event.id}
                            className="flex flex-col space-y-1 rounded-lg border p-3"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{event.title}</h4>
                              <span
                                className={cn(
                                  "rounded-full px-2 py-1 text-xs font-medium",
                                  event.type === "class"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-400"
                                    : event.type === "exam"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400"
                                    : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-400"
                                )}
                              >
                                {event.type}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {event.start_time} - {event.end_time}
                            </div>
                            {event.description && (
                              <p className="text-sm">{event.description}</p>
                            )}
                            <div className="flex justify-end space-x-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(event)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(event.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {isEditMode ? "Edit Event" : "Add New Event"}
                        </DialogTitle>
                        <DialogDescription>
                          {isEditMode
                            ? "Edit your event details"
                            : "Create a new event for your schedule"}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="title">
                            Title <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="title"
                            value={newEvent.title}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                title: e.target.value,
                              })
                            }
                            placeholder="Event title"
                            disabled={
                              createEvent.isPending || updateEvent.isPending
                            }
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="date">
                            Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="date"
                            type="date"
                            value={newEvent.date}
                            onChange={(e) =>
                              setNewEvent({ ...newEvent, date: e.target.value })
                            }
                            disabled={
                              createEvent.isPending || updateEvent.isPending
                            }
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="start-time">
                              Start Time <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="start-time"
                              type="time"
                              value={newEvent.start_time}
                              onChange={(e) =>
                                setNewEvent({
                                  ...newEvent,
                                  start_time: e.target.value,
                                })
                              }
                              disabled={
                                createEvent.isPending || updateEvent.isPending
                              }
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="end-time">
                              End Time <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="end-time"
                              type="time"
                              value={newEvent.end_time}
                              onChange={(e) =>
                                setNewEvent({
                                  ...newEvent,
                                  end_time: e.target.value,
                                })
                              }
                              disabled={
                                createEvent.isPending || updateEvent.isPending
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="type">Event Type</Label>
                          <Select
                            value={newEvent.type}
                            onValueChange={(value: EventType) =>
                              setNewEvent({ ...newEvent, type: value })
                            }
                            disabled={
                              createEvent.isPending || updateEvent.isPending
                            }
                          >
                            <SelectTrigger id="type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="class">Class</SelectItem>
                              <SelectItem value="exam">Exam</SelectItem>
                              <SelectItem value="study">Study</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newEvent.description || ""}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                description: e.target.value,
                              })
                            }
                            placeholder="Event details"
                            disabled={
                              createEvent.isPending || updateEvent.isPending
                            }
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleDialogClose}
                            disabled={
                              createEvent.isPending || updateEvent.isPending
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={
                              createEvent.isPending ||
                              updateEvent.isPending ||
                              !newEvent.title ||
                              !newEvent.date
                            }
                          >
                            {(createEvent.isPending ||
                              updateEvent.isPending) && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEditMode ? "Update Event" : "Create Event"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {events
                      .filter(
                        (event: ScheduleEvent) =>
                          event.date >= format(new Date(), "yyyy-MM-dd")
                      )
                      .sort((a: ScheduleEvent, b: ScheduleEvent) =>
                        a.date.localeCompare(b.date)
                      )
                      .slice(0, 3)
                      .map((event: ScheduleEvent) => (
                        <div
                          key={event.id}
                          className="flex justify-between text-sm"
                        >
                          <span>{event.title}</span>
                          <span className="text-muted-foreground">
                            {format(new Date(event.date), "MMM d")}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Events</CardTitle>
                <CardDescription>
                  View and manage all your scheduled events
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {isEditMode ? "Edit Event" : "Add New Event"}
                    </DialogTitle>
                    <DialogDescription>
                      {isEditMode
                        ? "Edit your event details"
                        : "Create a new event for your schedule"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            title: e.target.value,
                          })
                        }
                        placeholder="Event title"
                        disabled={
                          createEvent.isPending || updateEvent.isPending
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">
                        Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, date: e.target.value })
                        }
                        disabled={
                          createEvent.isPending || updateEvent.isPending
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="start-time">
                          Start Time <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={newEvent.start_time}
                          onChange={(e) =>
                            setNewEvent({
                              ...newEvent,
                              start_time: e.target.value,
                            })
                          }
                          disabled={
                            createEvent.isPending || updateEvent.isPending
                          }
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="end-time">
                          End Time <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={newEvent.end_time}
                          onChange={(e) =>
                            setNewEvent({
                              ...newEvent,
                              end_time: e.target.value,
                            })
                          }
                          disabled={
                            createEvent.isPending || updateEvent.isPending
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Event Type</Label>
                      <Select
                        value={newEvent.type}
                        onValueChange={(value: EventType) =>
                          setNewEvent({ ...newEvent, type: value })
                        }
                        disabled={
                          createEvent.isPending || updateEvent.isPending
                        }
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="class">Class</SelectItem>
                          <SelectItem value="exam">Exam</SelectItem>
                          <SelectItem value="study">Study</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description || ""}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            description: e.target.value,
                          })
                        }
                        placeholder="Event details"
                        disabled={
                          createEvent.isPending || updateEvent.isPending
                        }
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDialogClose}
                        disabled={
                          createEvent.isPending || updateEvent.isPending
                        }
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          createEvent.isPending ||
                          updateEvent.isPending ||
                          !newEvent.title ||
                          !newEvent.date
                        }
                      >
                        {(createEvent.isPending || updateEvent.isPending) && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isEditMode ? "Update Event" : "Create Event"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event: EventWithOriginalDates) => (
                  <div
                    key={event.id}
                    className="flex flex-col space-y-2 rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{event.title}</h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-medium",
                          event.type === "class"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-400"
                            : event.type === "exam"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400"
                            : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-400"
                        )}
                      >
                        {event.type}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>
                        {format(new Date(event.date), "MMMM d, yyyy")} •{" "}
                        {event.start_time} - {event.end_time}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm">{event.description}</p>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
