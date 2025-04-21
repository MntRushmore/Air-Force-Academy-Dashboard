"use client";

import { useState, useCallback } from "react";
import { Check, Flag, Plus, Target, Trash2, Dumbbell } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import type { DebouncedFunc } from "lodash";

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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Goal, NewGoal } from "@/lib/types";

type TabValue = "all" | "academic" | "fitness" | "application" | "other";
type GoalCategory = "Academic" | "Fitness" | "Application" | "Other";

export default function GoalsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<TabValue>("all");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newGoal, setNewGoal] = useState<NewGoal>({
    title: "",
    category: "Academic",
    description: "",
    deadline: format(new Date(), "yyyy-MM-dd"),
    progress: 0,
    completed: false,
  });

  // Fetch goals
  const { data: goals = [], isLoading: isLoadingGoals } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals");
      if (!response.ok) {
        throw new Error("Failed to fetch goals");
      }
      const data = await response.json();
      return data as Goal[];
    },
  });

  // Create goal mutation
  const createGoal = useMutation({
    mutationFn: async (goal: NewGoal) => {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goal),
      });
      if (!response.ok) {
        throw new Error("Failed to create goal");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({
        title: "Success",
        description: "Goal created successfully",
      });
      setIsDialogOpen(false);
      resetNewGoal();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update goal mutation
  const updateGoal = useMutation({
    mutationFn: async ({ id, ...changes }: { id: string } & Partial<Goal>) => {
      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...changes }),
      });
      if (!response.ok) {
        throw new Error("Failed to update goal");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({
        title: "Success",
        description: "Goal updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete goal mutation
  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/goals?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete goal");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({
        title: "Success",
        description: "Goal deleted successfully",
      });
      setSelectedGoal(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Debounced update goal mutation
  const debouncedUpdateGoal = useCallback(
    debounce((id: string, changes: Partial<Goal>) => {
      updateGoal.mutate({ id, ...changes });
    }, 500),
    []
  );

  const resetNewGoal = (category: GoalCategory = "Academic") => {
    setNewGoal({
      title: "",
      category,
      description: "",
      deadline: format(new Date(), "yyyy-MM-dd"),
      progress: 0,
      completed: false,
    });
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.deadline) return;
    createGoal.mutate(newGoal);
  };

  const handleUpdateGoal = (id: string, changes: Partial<Goal>) => {
    if (!id) return;
    updateGoal.mutate({ id, ...changes });
  };

  const handleDeleteGoal = (id: string) => {
    if (!id) return;
    deleteGoal.mutate(id);
  };

  const handleProgressChange = (id: string, progress: number) => {
    // Update UI immediately
    setSelectedGoal((prev) =>
      prev && prev.id === id ? { ...prev, progress } : prev
    );
    // Debounce the API call
    debouncedUpdateGoal(id, { progress });
  };

  const handleTabChange = (value: TabValue) => {
    setSelectedTab(value);
    // Update newGoal category when tab changes
    setNewGoal((prev) => ({
      ...prev,
      category: value as GoalCategory,
    }));
  };

  const handleAddGoalClick = (category: GoalCategory) => {
    resetNewGoal(category);
    setIsDialogOpen(true);
  };

  const handleCategoryChange = (category: GoalCategory) => {
    setNewGoal((prev) => ({
      ...prev,
      category,
    }));
  };

  // Filter goals by category
  const academicGoals = goals.filter(
    (goal: Goal) => goal.category === "Academic"
  );
  const fitnessGoals = goals.filter(
    (goal: Goal) => goal.category === "Fitness"
  );
  const applicationGoals = goals.filter(
    (goal: Goal) => goal.category === "Application"
  );
  const otherGoals = goals.filter(
    (goal: Goal) =>
      !["Academic", "Fitness", "Application"].includes(goal.category)
  );

  const getCategoryColor = (category: GoalCategory) => {
    switch (category) {
      case "Academic":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Fitness":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Application":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Other":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-600 dark:bg-green-500";
    if (progress >= 50) return "bg-blue-600 dark:bg-blue-500";
    if (progress >= 25) return "bg-amber-600 dark:bg-amber-500";
    return "bg-slate-600 dark:bg-slate-500";
  };

  const calculateDaysRemaining = (deadline: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getDeadlineStatus = (deadline: string) => {
    const daysRemaining = calculateDaysRemaining(deadline);

    if (daysRemaining < 0)
      return { text: "Overdue", color: "text-red-600 dark:text-red-400" };
    if (daysRemaining === 0)
      return { text: "Today", color: "text-amber-600 dark:text-amber-400" };
    if (daysRemaining <= 7)
      return {
        text: `${daysRemaining} days left`,
        color: "text-amber-600 dark:text-amber-400",
      };
    if (daysRemaining <= 30)
      return {
        text: `${daysRemaining} days left`,
        color: "text-blue-600 dark:text-blue-400",
      };
    return {
      text: `${daysRemaining} days left`,
      color: "text-green-600 dark:text-green-400",
    };
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Goal Tracker</h1>
        <p className="text-muted-foreground">
          Set and track your USAFA application goals
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{goals.length}</div>
            <div className="mt-2 flex items-center text-sm">
              <Target className="mr-1 h-4 w-4" />
              <span>
                {goals.length > 0
                  ? "Keep up the good work!"
                  : "Add your first goal"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#7d8ca3] to-[#a1afc2] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {goals.filter((g) => g.completed).length}
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Check className="mr-1 h-4 w-4" />
              <span>
                {goals.length > 0
                  ? `${Math.round(
                      (goals.filter((g) => g.completed).length / goals.length) *
                        100
                    )}% completion rate`
                  : "No goals added yet"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Application Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{applicationGoals.length}</div>
            <div className="mt-2 flex items-center text-sm">
              <Flag className="mr-1 h-4 w-4" />
              <span>
                {applicationGoals.filter((g) => g.completed).length} completed
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#7d8ca3] to-[#a1afc2] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {goals.length > 0
                ? `${Math.round(
                    goals.reduce((sum, goal) => sum + goal.progress, 0) /
                      goals.length
                  )}%`
                : "0%"}
            </div>
            <div className="mt-2">
              <Progress
                value={
                  goals.length > 0
                    ? goals.reduce((sum, goal) => sum + goal.progress, 0) /
                      goals.length
                    : 0
                }
                className="h-2 bg-white/20"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Goals</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
              <DialogDescription>
                Set a new goal to track your progress
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Goal Title</Label>
                <Input
                  id="goal-title"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                  placeholder="e.g., Complete SAT preparation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-category">Category</Label>
                <Select
                  value={newGoal.category}
                  onValueChange={(value: GoalCategory) =>
                    setNewGoal({ ...newGoal, category: value })
                  }
                >
                  <SelectTrigger id="goal-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Fitness">Fitness</SelectItem>
                    <SelectItem value="Application">Application</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-deadline">Deadline</Label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, deadline: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="goal-progress">Initial Progress</Label>
                  <span className="text-sm">{newGoal.progress || 0}%</span>
                </div>
                <Slider
                  id="goal-progress"
                  min={0}
                  max={100}
                  step={5}
                  value={[newGoal.progress || 0]}
                  onValueChange={(value) =>
                    setNewGoal({ ...newGoal, progress: value[0] })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="goal-completed"
                  checked={newGoal.completed}
                  onCheckedChange={(checked) =>
                    setNewGoal({ ...newGoal, completed: checked })
                  }
                />
                <Label htmlFor="goal-completed">Mark as completed</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={createGoal.isPending}>
                {createGoal.isPending ? (
                  <>
                    <span className="mr-2">Adding...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                  </>
                ) : (
                  "Add Goal"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingGoals ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Goals</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="fitness">Fitness</TabsTrigger>
            <TabsTrigger value="application">Application</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {goals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Target className="h-12 w-12 text-[#0033a0] mb-4" />
                  <h3 className="text-lg font-medium">No goals added yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your first goal to start tracking your progress
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Add Your First Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Goal</DialogTitle>
                        <DialogDescription>
                          Set a new goal to track your progress
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="goal-title-first">Goal Title</Label>
                          <Input
                            id="goal-title-first"
                            value={newGoal.title}
                            onChange={(e) =>
                              setNewGoal({ ...newGoal, title: e.target.value })
                            }
                            placeholder="e.g., Complete SAT preparation"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="goal-category-first">Category</Label>
                          <Select
                            value={newGoal.category}
                            onValueChange={(value: GoalCategory) =>
                              setNewGoal({ ...newGoal, category: value })
                            }
                          >
                            <SelectTrigger id="goal-category-first">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Academic">Academic</SelectItem>
                              <SelectItem value="Fitness">Fitness</SelectItem>
                              <SelectItem value="Application">
                                Application
                              </SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="goal-deadline-first">Deadline</Label>
                          <Input
                            id="goal-deadline-first"
                            type="date"
                            value={newGoal.deadline}
                            onChange={(e) =>
                              setNewGoal({
                                ...newGoal,
                                deadline: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={(e) => handleSubmit(e)}>
                          Add Goal
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal) => (
                  <Card
                    key={goal.id}
                    className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      selectedGoal?.id === goal.id
                        ? "ring-2 ring-[#0033a0]"
                        : ""
                    } ${
                      goal.completed ? "bg-gray-50 dark:bg-gray-900/50" : ""
                    }`}
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className={getCategoryColor(goal.category)}>
                            {goal.category}
                          </Badge>
                          <CardTitle
                            className={`mt-2 ${
                              goal.completed ? "line-through opacity-70" : ""
                            }`}
                          >
                            {goal.title}
                          </CardTitle>
                        </div>
                        {goal.completed && (
                          <div className="rounded-full bg-green-100 p-1 dark:bg-green-900">
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress:
                          </span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <Progress
                          value={goal.progress}
                          className={`h-2 ${
                            goal.completed
                              ? "bg-green-600 dark:bg-green-500"
                              : getProgressColor(goal.progress)
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Deadline:</span>
                        <span
                          className={getDeadlineStatus(goal.deadline).color}
                        >
                          {getDeadlineStatus(goal.deadline).text}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (goal.id) {
                            handleDeleteGoal(goal.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {selectedGoal && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge
                        className={getCategoryColor(selectedGoal.category)}
                      >
                        {selectedGoal.category}
                      </Badge>
                      <CardTitle className="mt-2">
                        {selectedGoal.title}
                      </CardTitle>
                      <CardDescription>
                        Deadline:{" "}
                        {new Date(selectedGoal.deadline).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="selected-goal-completed"
                          checked={selectedGoal.completed}
                          onCheckedChange={(checked) => {
                            if (selectedGoal.id) {
                              handleUpdateGoal(selectedGoal.id, {
                                completed: checked,
                              });
                            }
                          }}
                        />
                        <Label htmlFor="selected-goal-completed">
                          Completed
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="selected-goal-progress">Progress</Label>
                      <span className="text-sm">{selectedGoal.progress}%</span>
                    </div>
                    <Slider
                      id="selected-goal-progress"
                      min={0}
                      max={100}
                      step={5}
                      value={[selectedGoal.progress]}
                      onValueChange={(value) => {
                        if (selectedGoal?.id) {
                          handleProgressChange(selectedGoal.id, value[0]);
                        }
                      }}
                      disabled={selectedGoal.completed}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selected-goal-deadline">Deadline</Label>
                    <Input
                      id="selected-goal-deadline"
                      type="date"
                      value={selectedGoal.deadline}
                      onChange={(e) => {
                        if (selectedGoal.id) {
                          handleUpdateGoal(selectedGoal.id, {
                            deadline: e.target.value,
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selected-goal-category">Category</Label>
                    <Select
                      value={selectedGoal.category}
                      onValueChange={(value: GoalCategory) => {
                        if (selectedGoal.id) {
                          handleUpdateGoal(selectedGoal.id, {
                            category: value,
                          });
                        }
                      }}
                    >
                      <SelectTrigger id="selected-goal-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Fitness">Fitness</SelectItem>
                        <SelectItem value="Application">Application</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedGoal(null);
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (selectedGoal.id) {
                        handleDeleteGoal(selectedGoal.id);
                      }
                    }}
                  >
                    Delete Goal
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="academic" className="space-y-4">
            {academicGoals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Target className="h-12 w-12 text-[#0033a0] mb-4" />
                  <h3 className="text-lg font-medium">
                    No academic goals added yet
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add academic goals to track your progress
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => handleAddGoalClick("Academic")}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Academic Goal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {academicGoals.map((goal) => (
                  <Card
                    key={goal.id}
                    className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      selectedGoal?.id === goal.id
                        ? "ring-2 ring-[#0033a0]"
                        : ""
                    } ${
                      goal.completed ? "bg-gray-50 dark:bg-gray-900/50" : ""
                    }`}
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className={getCategoryColor(goal.category)}>
                            {goal.category}
                          </Badge>
                          <CardTitle
                            className={`mt-2 ${
                              goal.completed ? "line-through opacity-70" : ""
                            }`}
                          >
                            {goal.title}
                          </CardTitle>
                        </div>
                        {goal.completed && (
                          <div className="rounded-full bg-green-100 p-1 dark:bg-green-900">
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress:
                          </span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <Progress
                          value={goal.progress}
                          className={`h-2 ${
                            goal.completed
                              ? "bg-green-600 dark:bg-green-500"
                              : getProgressColor(goal.progress)
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Deadline:</span>
                        <span
                          className={getDeadlineStatus(goal.deadline).color}
                        >
                          {getDeadlineStatus(goal.deadline).text}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="fitness" className="space-y-4">
            {fitnessGoals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Dumbbell className="h-12 w-12 text-[#0033a0] mb-4" />
                  <h3 className="text-lg font-medium">
                    No fitness goals added yet
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add fitness goals to track your CFA preparation
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => handleAddGoalClick("Fitness")}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Fitness Goal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {fitnessGoals.map((goal) => (
                  <Card
                    key={goal.id}
                    className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      selectedGoal?.id === goal.id
                        ? "ring-2 ring-[#0033a0]"
                        : ""
                    } ${
                      goal.completed ? "bg-gray-50 dark:bg-gray-900/50" : ""
                    }`}
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className={getCategoryColor(goal.category)}>
                            {goal.category}
                          </Badge>
                          <CardTitle
                            className={`mt-2 ${
                              goal.completed ? "line-through opacity-70" : ""
                            }`}
                          >
                            {goal.title}
                          </CardTitle>
                        </div>
                        {goal.completed && (
                          <div className="rounded-full bg-green-100 p-1 dark:bg-green-900">
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress:
                          </span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <Progress
                          value={goal.progress}
                          className={`h-2 ${
                            goal.completed
                              ? "bg-green-600 dark:bg-green-500"
                              : getProgressColor(goal.progress)
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Deadline:</span>
                        <span
                          className={getDeadlineStatus(goal.deadline).color}
                        >
                          {getDeadlineStatus(goal.deadline).text}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="application" className="space-y-4">
            {applicationGoals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Flag className="h-12 w-12 text-[#0033a0] mb-4" />
                  <h3 className="text-lg font-medium">
                    No application goals added yet
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add application goals to track your USAFA application
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => handleAddGoalClick("Application")}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Application Goal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {applicationGoals.map((goal) => (
                  <Card
                    key={goal.id}
                    className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      selectedGoal?.id === goal.id
                        ? "ring-2 ring-[#0033a0]"
                        : ""
                    } ${
                      goal.completed ? "bg-gray-50 dark:bg-gray-900/50" : ""
                    }`}
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className={getCategoryColor(goal.category)}>
                            {goal.category}
                          </Badge>
                          <CardTitle
                            className={`mt-2 ${
                              goal.completed ? "line-through opacity-70" : ""
                            }`}
                          >
                            {goal.title}
                          </CardTitle>
                        </div>
                        {goal.completed && (
                          <div className="rounded-full bg-green-100 p-1 dark:bg-green-900">
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress:
                          </span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <Progress
                          value={goal.progress}
                          className={`h-2 ${
                            goal.completed
                              ? "bg-green-600 dark:bg-green-500"
                              : getProgressColor(goal.progress)
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Deadline:</span>
                        <span
                          className={getDeadlineStatus(goal.deadline).color}
                        >
                          {getDeadlineStatus(goal.deadline).text}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
