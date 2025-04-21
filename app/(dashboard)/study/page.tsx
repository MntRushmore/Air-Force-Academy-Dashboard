"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addMinutes } from "date-fns";
import { Book, Plus, Star, Clock, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import type { StudySession, NewStudySession, StudySubject } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/lib/hooks/use-auth";

const supabase = createClient();

export default function StudyPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSession, setNewSession] = useState<NewStudySession>({
    subject: "Mathematics",
    topic: "",
    duration_minutes: 30,
    start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end_time: format(addMinutes(new Date(), 30), "yyyy-MM-dd'T'HH:mm"),
    productivity_rating: 3,
    notes: "",
  });
  const user = useAuth();

  // Fetch study sessions
  const { data: studySessions = [], isLoading } = useQuery({
    queryKey: ["study-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.user?.id)
        .order("start_time", { ascending: false });

      if (error) throw error;
      return data as StudySession[];
    },
  });

  // Create study session mutation
  const createSession = useMutation({
    mutationFn: async (session: NewStudySession) => {
      const { data, error } = await supabase
        .from("study_sessions")
        .insert({ ...session, user_id: user.user?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
      toast({
        title: "Success",
        description: "Study session created successfully",
      });
      setIsDialogOpen(false);
      resetNewSession();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create study session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete study session mutation
  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("study_sessions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
      toast({
        title: "Success",
        description: "Study session deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete study session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetNewSession = () => {
    setNewSession({
      subject: "Mathematics",
      topic: "",
      duration_minutes: 30,
      start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      end_time: format(addMinutes(new Date(), 30), "yyyy-MM-dd'T'HH:mm"),
      productivity_rating: 3,
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSession.mutate(newSession);
  };

  const handleDurationChange = (value: number[]) => {
    const duration = value[0];
    const startDate = new Date(newSession.start_time);
    const endDate = addMinutes(startDate, duration);

    setNewSession({
      ...newSession,
      duration_minutes: duration,
      end_time: format(endDate, "yyyy-MM-dd'T'HH:mm"),
    });
  };

  const handleStartTimeChange = (value: string) => {
    const startDate = new Date(value);
    const endDate = addMinutes(startDate, newSession.duration_minutes);

    setNewSession({
      ...newSession,
      start_time: value,
      end_time: format(endDate, "yyyy-MM-dd'T'HH:mm"),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Study Sessions</h1>
        <p className="text-muted-foreground">
          Track and manage your study sessions
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Recent Sessions
          </h2>
          <p className="text-sm text-muted-foreground">
            Your study history and progress
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Study Session</DialogTitle>
              <DialogDescription>
                Record a new study session to track your progress
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={newSession.subject}
                    onValueChange={(value: StudySubject) =>
                      setNewSession({ ...newSession, subject: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Computer Science">
                        Computer Science
                      </SelectItem>
                      <SelectItem value="Foreign Language">
                        Foreign Language
                      </SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={newSession.topic}
                    onChange={(e) =>
                      setNewSession({ ...newSession, topic: e.target.value })
                    }
                    placeholder="e.g., Calculus - Derivatives"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="datetime-local"
                    value={newSession.start_time}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <span className="text-sm text-muted-foreground">
                      {newSession.duration_minutes} min
                    </span>
                  </div>
                  <Slider
                    id="duration"
                    min={15}
                    max={180}
                    step={15}
                    value={[newSession.duration_minutes]}
                    onValueChange={handleDurationChange}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label htmlFor="productivity">Productivity Rating</Label>
                    <span className="text-sm text-muted-foreground">
                      {newSession.productivity_rating}/5
                    </span>
                  </div>
                  <Slider
                    id="productivity"
                    min={1}
                    max={5}
                    step={1}
                    value={[newSession.productivity_rating]}
                    onValueChange={(value) =>
                      setNewSession({
                        ...newSession,
                        productivity_rating: value[0],
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={newSession.notes}
                    onChange={(e) =>
                      setNewSession({ ...newSession, notes: e.target.value })
                    }
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createSession.isPending}>
                  {createSession.isPending ? "Adding..." : "Add Session"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : studySessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Book className="h-12 w-12 text-[#0033a0] mb-4" />
            <h3 className="text-lg font-medium">No study sessions yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start tracking your study sessions to monitor your progress
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {studySessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{session.subject}</CardTitle>
                    <CardDescription>{session.topic}</CardDescription>
                  </div>
                  <div className="flex items-center">
                    {Array.from({ length: session.productivity_rating }).map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-yellow-400 fill-yellow-400"
                        />
                      )
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    {format(new Date(session.start_time), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>
                    {format(new Date(session.start_time), "h:mm a")} -{" "}
                    {format(new Date(session.end_time), "h:mm a")} (
                    {session.duration_minutes} minutes)
                  </span>
                </div>
                {session.notes && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {session.notes}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => deleteSession.mutate(session.id)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
