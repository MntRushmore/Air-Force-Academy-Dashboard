import { Database } from "./database.types";

export type Event = Database["public"]["Tables"]["events"]["Row"];
export type NewEvent = Database["public"]["Tables"]["events"]["Insert"];
export type UpdateEvent = Database["public"]["Tables"]["events"]["Update"];

export interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  location: string;
  start: string;
  end: string;
  categories: string[];
  status: string;
  created: string;
  lastModified: string;
}

export interface ScheduleSettings {
  showPastEvents: boolean;
  dayStartHour: string;
  dayEndHour: string;
  defaultView: string;
  categories: string[];
}

export type EventType = "class" | "exam" | "study" | "other";

export interface ScheduleEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date: string; // Format: YYYY-MM-DD
  start_time: string; // Format: HH:mm
  end_time: string; // Format: HH:mm
  type: EventType;
  created_at: string;
  updated_at: string;
}

export type NewScheduleEventInput = Omit<
  ScheduleEvent,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type IntegrationProvider = "google" | "microsoft" | "canvas";
export type IntegrationStatus = "active" | "inactive" | "error" | "pending";

export interface Integration {
  id: string;
  user_id: string;
  provider: IntegrationProvider;
  access_token: string;
  refresh_token?: string;
  token_expires_at: string;
  status: IntegrationStatus;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type IntegrationLogEventType = "sync" | "auth" | "error" | "update";

export interface IntegrationLog {
  id: string;
  integration_id: string;
  event_type: IntegrationLogEventType;
  status: "success" | "error";
  message: string;
  error_message?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type CalendarType = "google" | "outlook" | "ical";
export type SyncFrequency = "hourly" | "daily" | "weekly";

export interface CalendarConnection {
  id: string;
  user_id: string;
  name: string;
  type: CalendarType;
  external_id: string;
  sync_frequency: SyncFrequency;
  last_synced_at?: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ExternalEvent {
  id: string;
  calendar_connection_id: string;
  external_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees?: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GoogleClassroomData {
  id: string;
  user_id: string;
  course_id: string;
  course_name: string;
  section?: string;
  description?: string;
  room?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export type AssignmentState = "draft" | "published" | "deleted";

export interface GoogleClassroomAssignment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  materials?: Record<string, unknown>[];
  due_date?: string;
  max_points?: number;
  work_type: string;
  state: AssignmentState;
  alternate_link?: string;
  created_at: string;
  updated_at: string;
}

export type SubmissionState =
  | "new"
  | "created"
  | "turned_in"
  | "returned"
  | "reclaimed_by_student";

export interface GoogleClassroomSubmission {
  id: string;
  course_id: string;
  course_work_id: string;
  user_id: string;
  state: SubmissionState;
  submission_history?: Record<string, unknown>[];
  assigned_grade?: number;
  draft_grade?: number;
  created_at: string;
  updated_at: string;
}

export type GoalCategory =
  | "academic"
  | "fitness"
  | "personal"
  | "career"
  | "other";
export type GoalStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "cancelled";
export type GoalPriority = "low" | "medium" | "high";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: "Academic" | "Fitness" | "Application" | "Other";
  deadline: string;
  progress: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export type NewGoal = Omit<
  Goal,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type StudySubject =
  | "Mathematics"
  | "Physics"
  | "Chemistry"
  | "Biology"
  | "English"
  | "History"
  | "Computer Science"
  | "Foreign Language"
  | "Other";

export interface StudySession {
  id: string;
  user_id: string;
  subject: StudySubject;
  topic: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  productivity_rating: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type NewStudySession = Omit<
  StudySession,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export interface FitnessRecord {
  id: string;
  user_id: string;
  name: string;
  current_value: number;
  target_value: number;
  unit: string;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type NewFitnessRecord = Omit<
  FitnessRecord,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export interface FitnessGoal {
  id: string;
  user_id: string;
  target_date: string;
  pushups_goal: number | null;
  situps_goal: number | null;
  pullups_goal: number | null;
  mile_run_goal: string | null; // interval stored as string "HH:MM:SS"
  weight_goal_kg: number | null;
  body_fat_goal_percentage: number | null;
  notes: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export type NewFitnessGoal = Omit<
  FitnessGoal,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type WorkoutIntensity = "low" | "medium" | "high";

export interface WorkoutLog {
  id: string;
  user_id: string;
  date: string;
  workout_type: string;
  duration_minutes: number;
  intensity: WorkoutIntensity;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
  }[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type NewWorkoutLog = Omit<
  WorkoutLog,
  "id" | "user_id" | "created_at" | "updated_at"
>;
