"use client";

import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Dumbbell,
  Plus,
  Target,
  Trophy,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/db";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  calculateCFAScore,
  calculateExerciseProgress,
  cfaStandardsMale,
  cfaStandardsFemale,
  type Exercise,
} from "@/lib/fitness-utils";
import { calculateApplicationProgress } from "@/lib/application-utils";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

interface NewExercise extends Omit<Exercise, "id" | "user_id" | "created_at"> {}

export default function FitnessPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const goals = useLiveQuery(() => db.goals.toArray(), []) || [];
  const courses = useLiveQuery(() => db.courses.toArray(), []) || [];
  const grades = useLiveQuery(() => db.grades.toArray(), []) || [];

  const [gender, setGender] = useState<"male" | "female">("male");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [newExercise, setNewExercise] = useState<Partial<NewExercise>>({
    exercise_type: "",
    value: 0,
    target_value: 0,
    unit: "reps",
    date: new Date().toISOString().split("T")[0],
  });

  const cfaStandards =
    gender === "male" ? cfaStandardsMale : cfaStandardsFemale;

  // Fetch exercises from Supabase
  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("fitness_records")
        .select("*")
        .eq("user_id", user.user.id)
        .order("date", { ascending: false });

      if (error) {
        toast.error("Failed to fetch exercises");
        throw error;
      }

      return data;
    },
  });

  // Add single exercise mutation
  const addExerciseMutation = useMutation({
    mutationFn: async (exercise: NewExercise) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("fitness_records")
        .insert([{ ...exercise, user_id: user.user.id }])
        .select()
        .single();

      console.log({ data, error });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("Exercise added successfully");
      setNewExercise({
        exercise_type: "",
        value: 0,
        target_value: 0,
        unit: "reps",
        date: new Date().toISOString().split("T")[0],
      });
    },
    onError: (error) => {
      toast.error("Failed to add exercise");
      console.error("Error adding exercise:", error);
    },
  });

  // Add bulk exercises mutation
  const addBulkExercisesMutation = useMutation({
    mutationFn: async (exercises: NewExercise[]) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const exercisesWithUserId = exercises.map((exercise) => ({
        ...exercise,
        user_id: user.user.id,
      }));

      const { data, error } = await supabase
        .from("fitness_records")
        .insert(exercisesWithUserId)
        .select();

      console.log({ data, error });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("Exercises added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add exercises");
      console.error("Error adding exercises:", error);
    },
  });

  // Update exercise mutation
  const updateExerciseMutation = useMutation({
    mutationFn: async ({
      id,
      changes,
    }: {
      id: string;
      changes: Partial<Exercise>;
    }) => {
      const { data, error } = await supabase
        .from("fitness_records")
        .update(changes)
        .eq("id", id)
        .select()
        .single();

      console.log({ data, error });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("Exercise updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update exercise");
      console.error("Error updating exercise:", error);
    },
  });

  // Delete exercise mutation
  const deleteExerciseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("fitness_records")
        .delete()
        .eq("id", id);

      console.log({ error });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("Exercise deleted successfully");
      if (selectedExercise) setSelectedExercise(null);
    },
    onError: (error) => {
      toast.error("Failed to delete exercise");
      console.error("Error deleting exercise:", error);
    },
  });

  // Calculate CFA score using the latest value for each exercise type
  const latestExercises = exercises.reduce((acc, curr) => {
    if (
      !acc[curr.exercise_type] ||
      new Date(curr.date) > new Date(acc[curr.exercise_type].date)
    ) {
      acc[curr.exercise_type] = curr;
    }
    return acc;
  }, {} as Record<string, Exercise>);

  const cfaScore = calculateCFAScore(Object.values(latestExercises), gender);

  const handleAddExercise = () => {
    if (!newExercise.exercise_type) return;

    addExerciseMutation.mutate({
      exercise_type: newExercise.exercise_type,
      value: newExercise.value || 0,
      target_value: newExercise.target_value || 0,
      unit: newExercise.unit || "reps",
      date: newExercise.date || new Date().toISOString().split("T")[0],
    } as NewExercise);
  };

  const handleAddAllCFAExercises = () => {
    const standards = gender === "male" ? cfaStandardsMale : cfaStandardsFemale;
    const today = new Date().toISOString().split("T")[0];

    const exercises = Object.entries(standards).map(([name, standard]) => ({
      exercise_type: name,
      value: standard.min,
      target_value: standard.max,
      unit: standard.unit,
      date: today,
    }));

    addBulkExercisesMutation.mutate(exercises);
  };

  const handleUpdateExercise = (id: string, changes: Partial<Exercise>) => {
    if (!id) return;
    updateExerciseMutation.mutate({ id, changes });
  };

  const handleDeleteExercise = (id: string) => {
    if (!id) return;
    deleteExerciseMutation.mutate(id);
  };

  const calculateGPA = (courses: any[], grades: any[]): number => {
    // Simple GPA calculation for now
    if (courses.length === 0) return 0;
    return 3.5; // Placeholder value, should use the actual GPA calculation
  };

  const gpa = calculateGPA(courses, grades);

  // Calculate application progress
  const { overall: applicationProgress } = calculateApplicationProgress(
    goals,
    exercises,
    gender,
    gpa
  );

  // Update application progress in settings
  useEffect(() => {
    const updateApplicationProgress = async () => {
      await db.settings.put({
        key: "applicationProgress",
        value: applicationProgress,
        createdAt: new Date(),
      });
    };

    updateApplicationProgress();
  }, [applicationProgress]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Fitness Tracker</h1>
        <p className="text-muted-foreground">
          Prepare for the Candidate Fitness Assessment (CFA)
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CFA Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cfaScore}/100</div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>Based on current performance</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#7d8ca3] to-[#a1afc2] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CFA Standards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold capitalize">{gender}</div>
            <div className="mt-2 flex items-center text-sm">
              <Select
                value={gender}
                onValueChange={(value) => setGender(value as "male" | "female")}
              >
                <SelectTrigger className="h-8 w-32 border-white/20 bg-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Exercises Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{exercises.length}</div>
            <div className="mt-2 flex items-center text-sm">
              <Dumbbell className="mr-1 h-4 w-4" />
              <span>
                {exercises.length === 6
                  ? "All CFA events tracked"
                  : "Add more exercises"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#7d8ca3] to-[#a1afc2] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Next Milestone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {exercises.length > 0 ? "Improve Score" : "Add Exercises"}
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Target className="mr-1 h-4 w-4" />
              <span>Track your progress</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exercises" className="space-y-4">
        <TabsList>
          <TabsTrigger value="exercises">CFA Exercises</TabsTrigger>
          <TabsTrigger value="standards">CFA Standards</TabsTrigger>
          <TabsTrigger value="training">Training Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Your Exercises</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Exercise
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Exercise</DialogTitle>
                  <DialogDescription>
                    Track a new exercise for your CFA preparation
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="exercise-name">Exercise Name</Label>
                    <Select
                      value={newExercise.exercise_type}
                      onValueChange={(value) => {
                        const standard =
                          cfaStandards[value as keyof typeof cfaStandards];
                        setNewExercise({
                          ...newExercise,
                          exercise_type: value,
                          unit: standard?.unit || "reps",
                          value: standard?.max || 0,
                          target_value: standard?.max || 0,
                        });
                      }}
                    >
                      <SelectTrigger id="exercise-name">
                        <SelectValue placeholder="Select exercise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Basketball Throw">
                          Basketball Throw
                        </SelectItem>
                        <SelectItem value="Pull-ups">Pull-ups</SelectItem>
                        <SelectItem value="Shuttle Run">Shuttle Run</SelectItem>
                        <SelectItem value="Crunches">Crunches</SelectItem>
                        <SelectItem value="Push-ups">Push-ups</SelectItem>
                        <SelectItem value="1-Mile Run">1-Mile Run</SelectItem>
                        <SelectItem value="Custom Exercise">
                          Custom Exercise
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {newExercise.exercise_type === "Custom Exercise" && (
                      <Input
                        className="mt-2"
                        placeholder="Enter exercise name"
                        value={
                          newExercise.exercise_type === "Custom Exercise"
                            ? ""
                            : newExercise.exercise_type
                        }
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            exercise_type: e.target.value,
                          })
                        }
                      />
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="exercise-current">Current Value</Label>
                      <Input
                        id="exercise-current"
                        type="number"
                        step="0.1"
                        value={newExercise.value}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            value: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exercise-target">Target Value</Label>
                      <Input
                        id="exercise-target"
                        type="number"
                        step="0.1"
                        value={newExercise.target_value}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            target_value: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exercise-unit">Unit</Label>
                    <Select
                      value={newExercise.unit}
                      onValueChange={(value) =>
                        setNewExercise({ ...newExercise, unit: value })
                      }
                    >
                      <SelectTrigger id="exercise-unit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reps">Repetitions</SelectItem>
                        <SelectItem value="seconds">Seconds</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="feet">Feet</SelectItem>
                        <SelectItem value="meters">Meters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddExercise}>Add Exercise</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {exercises.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Dumbbell className="h-12 w-12 text-[#0033a0] mb-4" />
                <h3 className="text-lg font-medium">No exercises added yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add exercises to track your CFA preparation
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" /> Add CFA Exercises
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add CFA Exercises</DialogTitle>
                      <DialogDescription>
                        Add all six CFA exercises to your tracker
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="mb-4">
                        This will add all six Candidate Fitness Assessment (CFA)
                        exercises to your tracker with default values. You can
                        update your current performance after adding them.
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Basketball Throw</li>
                        <li>Pull-ups</li>
                        <li>Shuttle Run</li>
                        <li>Crunches</li>
                        <li>Push-ups</li>
                        <li>1-Mile Run</li>
                      </ul>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddAllCFAExercises}>
                        Add All CFA Exercises
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {exercises.map((exercise) => {
                const { percentage, score } = calculateExerciseProgress(
                  exercise,
                  gender
                );

                return (
                  <Card
                    key={exercise.id}
                    className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      selectedExercise?.id === exercise.id
                        ? "ring-2 ring-[#0033a0]"
                        : ""
                    }`}
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>{exercise.exercise_type}</CardTitle>
                        <div className="text-xl font-bold text-[#0033a0]">
                          {score}/100
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Current:
                          </span>
                          <span className="font-medium">
                            {exercise.value} {exercise.unit}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Target:</span>
                          <span>
                            {exercise.target_value} {exercise.unit}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (exercise.id) {
                              handleDeleteExercise(exercise.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {selectedExercise && (
            <Card>
              <CardHeader>
                <CardTitle>Update {selectedExercise.exercise_type}</CardTitle>
                <CardDescription>Track your progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="update-current">Current Value</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="update-current"
                        type="number"
                        step="0.1"
                        defaultValue={selectedExercise.value}
                        onChange={(e) => {
                          if (selectedExercise.id) {
                            handleUpdateExercise(selectedExercise.id, {
                              value: Number(e.target.value),
                            });
                          }
                        }}
                      />
                      <span>{selectedExercise.unit}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="update-target">Target Value</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="update-target"
                        type="number"
                        step="0.1"
                        defaultValue={selectedExercise.target_value}
                        onChange={(e) => {
                          if (selectedExercise.id) {
                            handleUpdateExercise(selectedExercise.id, {
                              target_value: Number(e.target.value),
                            });
                          }
                        }}
                      />
                      <span>{selectedExercise.unit}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedExercise(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedExercise.id) {
                      handleDeleteExercise(selectedExercise.id);
                    }
                  }}
                >
                  Delete Exercise
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="standards" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    CFA Standards for {gender === "male" ? "Males" : "Females"}
                  </CardTitle>
                  <CardDescription>
                    Candidate Fitness Assessment requirements for USAFA
                  </CardDescription>
                </div>
                <Select
                  value={gender}
                  onValueChange={(value) =>
                    setGender(value as "male" | "female")
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exercise</TableHead>
                    <TableHead>Minimum</TableHead>
                    <TableHead>Average</TableHead>
                    <TableHead>Competitive</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Your Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(cfaStandards).map(([name, standard]) => {
                    const exercise = exercises.find(
                      (e) => e.exercise_type === name
                    );
                    const average = (standard.min + standard.max) / 2;

                    let status = "Not Started";
                    let statusColor = "text-slate-500";

                    if (exercise) {
                      if (standard.isReversed) {
                        // Lower is better
                        if (exercise.value <= standard.max) {
                          status = "Excellent";
                          statusColor = "text-green-600 dark:text-green-400";
                        } else if (exercise.value <= average) {
                          status = "Good";
                          statusColor = "text-blue-600 dark:text-blue-400";
                        } else if (exercise.value <= standard.min) {
                          status = "Needs Work";
                          statusColor = "text-amber-600 dark:text-amber-400";
                        } else {
                          status = "Below Minimum";
                          statusColor = "text-red-600 dark:text-red-400";
                        }
                      } else {
                        // Higher is better
                        if (exercise.value >= standard.max) {
                          status = "Excellent";
                          statusColor = "text-green-600 dark:text-green-400";
                        } else if (exercise.value >= average) {
                          status = "Good";
                          statusColor = "text-blue-600 dark:text-blue-400";
                        } else if (exercise.value >= standard.min) {
                          status = "Needs Work";
                          statusColor = "text-amber-600 dark:text-amber-400";
                        } else {
                          status = "Below Minimum";
                          statusColor = "text-red-600 dark:text-red-400";
                        }
                      }
                    }

                    return (
                      <TableRow key={name}>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell>
                          {standard.min} {standard.unit}
                        </TableCell>
                        <TableCell>
                          {average.toFixed(1)} {standard.unit}
                        </TableCell>
                        <TableCell>
                          {standard.max} {standard.unit}
                        </TableCell>
                        <TableCell>{standard.unit}</TableCell>
                        <TableCell className={statusColor}>{status}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About the CFA</CardTitle>
              <CardDescription>
                Understanding the Candidate Fitness Assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Candidate Fitness Assessment (CFA) is a test of strength,
                agility, speed and endurance used to predict a candidate's
                aptitude for the physical program at the United States Air Force
                Academy. The CFA consists of six events:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <span className="font-medium">Basketball Throw</span> -
                  Measures upper body strength and coordination
                </li>
                <li>
                  <span className="font-medium">Pull-ups</span> - Measures upper
                  body strength and endurance
                </li>
                <li>
                  <span className="font-medium">Shuttle Run</span> - Measures
                  agility, speed and coordination
                </li>
                <li>
                  <span className="font-medium">Crunches</span> - Measures
                  abdominal strength and endurance
                </li>
                <li>
                  <span className="font-medium">Push-ups</span> - Measures upper
                  body strength and endurance
                </li>
                <li>
                  <span className="font-medium">1-Mile Run</span> - Measures
                  aerobic capacity and endurance
                </li>
              </ol>
              <p>
                The CFA must be administered by a physical education teacher, an
                officer in any branch of the military, or a USAFA Admissions
                Liaison Officer (ALO). The assessment must be completed
                according to specific guidelines and submitted as part of your
                application.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CFA Training Plans</CardTitle>
              <CardDescription>
                Structured workouts to improve your performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0033a0]">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">
                      12-Week CFA Preparation Plan
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive training to maximize your CFA score
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Week 1-4: Foundation</span>
                      <span>Build baseline fitness</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Week 5-8: Development</span>
                      <span>Increase intensity</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Week 9-12: Peak Performance</span>
                      <span>Maximize results</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </div>
                <Button className="mt-4 w-full">View Full Plan</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Upper Body Strength</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Focus on pull-ups and push-ups
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>
                        3 sets of max effort pull-ups, 3 times per week
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>
                        5 sets of push-ups (to failure), every other day
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Assisted pull-up training for progression</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="mt-4 w-full">
                    View Workout
                  </Button>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Cardio Endurance</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Improve 1-mile run time
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Interval training: 400m repeats</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Tempo runs: 2-3 miles at moderate pace</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Weekly long run for endurance building</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="mt-4 w-full">
                    View Workout
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Core Strength</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Maximize crunches performance
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Plank variations: 3 sets of 60 seconds</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Russian twists: 3 sets of 20 reps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Leg raises: 3 sets of 15 reps</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="mt-4 w-full">
                    View Workout
                  </Button>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Agility Training</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Improve shuttle run performance
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Ladder drills: 5 minutes, 3 times per week</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Cone drills: 5 sets with full recovery</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-[#0033a0]" />
                      <span>Shuttle run practice: 10 repetitions</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="mt-4 w-full">
                    View Workout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
