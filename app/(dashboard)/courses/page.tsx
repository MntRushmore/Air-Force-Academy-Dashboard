"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client-utils"; // Fixed import path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/hooks/use-auth";

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  semester: string;
  year: number;
  grade?: string | null;
  is_ap: boolean;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAP, setFilterAP] = useState(false);
  const [filterSemester, setFilterSemester] = useState<string>("");
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    name: "",
    code: "",
    credits: 3,
    semester: "Fall",
    year: new Date().getFullYear(),
    grade: null,
    is_ap: false,
  });

  const { toast } = useToast();
  const supabase = createClient();

  const years = Array.from(new Set(courses.map((course) => course.year))).sort(
    (a, b) => b - a
  );

  const semesters = Array.from(
    new Set(courses.map((course) => course.semester))
  );

  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  async function fetchCourses() {
    try {
      setLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", user?.id)
        .order("year", { ascending: false })
        .order("semester", { ascending: false })
        .order("name", { ascending: true });

      if (error) throw error;

      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function addCourse() {
    try {
      if (!user) return;
      const { data, error } = await supabase
        .from("courses")
        .insert([{ ...newCourse, user_id: user.id }])
        .select();

      if (error) throw error;

      const newCourseData = data?.[0] as Course;
      setCourses([...courses, newCourseData]);

      setNewCourse({
        name: "",
        code: "",
        credits: 3,
        semester: "Fall",
        year: new Date().getFullYear(),
        grade: null,
        is_ap: false,
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Course added successfully!",
      });
    } catch (error) {
      console.error("Error adding course:", error);
      toast({
        title: "Error",
        description: "Failed to add course. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function updateCourse() {
    if (!editingCourse) return;
    if (!user) return;
    try {
      const { error } = await supabase
        .from("courses")
        .update({ ...editingCourse, user_id: user.id })
        .eq("id", editingCourse.id);

      if (error) throw error;

      setCourses(
        courses.map((course) =>
          course.id === editingCourse.id ? editingCourse : course
        )
      );
      setIsEditDialogOpen(false);

      toast({
        title: "Success",
        description: "Course updated successfully!",
      });
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: "Failed to update course. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function deleteCourse() {
    if (!editingCourse) return;
    if (!user) return;
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("user_id", user.id)
        .eq("id", editingCourse.id);

      if (error) throw error;

      setCourses(courses.filter((course) => course.id !== editingCourse.id));
      setIsDeleteDialogOpen(false);

      toast({
        title: "Success",
        description: "Course deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    }
  }

  function handleEditCourse(course: Course) {
    setEditingCourse({ ...course });
    setIsEditDialogOpen(true);
  }

  function handleDeleteCourse(course: Course) {
    setEditingCourse({ ...course });
    setIsDeleteDialogOpen(true);
  }

  function resetFilters() {
    setSearchTerm("");
    setFilterAP(false);
    setFilterSemester("");
    setFilterYear(null);
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAP = filterAP ? course.is_ap : true;
    const matchesSemester = filterSemester
      ? course.semester === filterSemester
      : true;
    const matchesYear = filterYear ? course.year === filterYear : true;

    return matchesSearch && matchesAP && matchesSemester && matchesYear;
  });

  const isFiltering = searchTerm || filterAP || filterSemester || filterYear;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            Manage your courses and track your academic progress
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Filters</CardTitle>
          <CardDescription>
            Filter your courses by name, type, semester, or year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ap-filter"
                checked={filterAP}
                onCheckedChange={(checked) => setFilterAP(checked as boolean)}
              />
              <Label htmlFor="ap-filter">AP Courses Only</Label>
            </div>

            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterYear ? filterYear.toString() : ""}
              onValueChange={(value) =>
                setFilterYear(value ? Number.parseInt(value) : null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isFiltering && (
            <div className="mt-4 flex items-center">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <X className="mr-2 h-3 w-3" /> Clear Filters
              </Button>
              <span className="ml-2 text-sm text-muted-foreground">
                Showing {filteredCourses.length} of {courses.length} courses
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{course.name}</CardTitle>
                  {course.is_ap && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    >
                      AP
                    </Badge>
                  )}
                </div>
                <CardDescription>{course.code}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credits:</span>
                    <span>{course.credits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semester:</span>
                    <span>
                      {course.semester} {course.year}
                    </span>
                  </div>
                  {course.grade && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Grade:</span>
                      <span className="font-medium">{course.grade}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCourse(course)}
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteCourse(course)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <Filter className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {courses.length > 0
                ? "Try adjusting your filters or search term."
                : "Get started by adding your first course."}
            </p>
            {courses.length === 0 && (
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Course
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>
              Enter the details for your new course.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newCourse.name}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, name: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Course Code
              </Label>
              <Input
                id="code"
                value={newCourse.code}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, code: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="credits" className="text-right">
                Credits
              </Label>
              <Input
                id="credits"
                type="number"
                min="0"
                max="6"
                value={newCourse.credits}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    credits: Number.parseFloat(e.target.value),
                  })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="semester" className="text-right">
                Semester
              </Label>
              <Select
                value={newCourse.semester}
                onValueChange={(value) =>
                  setNewCourse({ ...newCourse, semester: value })
                }
              >
                <SelectTrigger id="semester" className="col-span-3">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fall">Fall</SelectItem>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year" className="text-right">
                Year
              </Label>
              <Input
                id="year"
                type="number"
                min="2000"
                max="2100"
                value={newCourse.year}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    year: Number.parseInt(e.target.value),
                  })
                }
                className="col-span-3"
                required
              />
            </div>

            {/* Add grade field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade" className="text-right">
                Grade
              </Label>
              <Input
                id="grade"
                value={newCourse.grade || ""}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    grade: e.target.value || null,
                  })
                }
                className="col-span-3"
                placeholder="Optional"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is-ap" className="text-right">
                AP Course
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="is-ap"
                  checked={newCourse.is_ap}
                  onCheckedChange={(checked) =>
                    setNewCourse({ ...newCourse, is_ap: checked })
                  }
                />
                <Label htmlFor="is-ap">
                  This is an Advanced Placement course
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addCourse}>Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the details for this course.
            </DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingCourse.name}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-code" className="text-right">
                  Course Code
                </Label>
                <Input
                  id="edit-code"
                  value={editingCourse.code}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, code: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-credits" className="text-right">
                  Credits
                </Label>
                <Input
                  id="edit-credits"
                  type="number"
                  min="0"
                  max="6"
                  value={editingCourse.credits}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      credits: Number.parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-semester" className="text-right">
                  Semester
                </Label>
                <Select
                  value={editingCourse.semester}
                  onValueChange={(value) =>
                    setEditingCourse({ ...editingCourse, semester: value })
                  }
                >
                  <SelectTrigger id="edit-semester" className="col-span-3">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-year" className="text-right">
                  Year
                </Label>
                <Input
                  id="edit-year"
                  type="number"
                  min="2000"
                  max="2100"
                  value={editingCourse.year}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      year: Number.parseInt(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-grade" className="text-right">
                  Grade
                </Label>
                <Input
                  id="edit-grade"
                  value={editingCourse.grade || ""}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      grade: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-is-ap" className="text-right">
                  AP Course
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="edit-is-ap"
                    checked={editingCourse.is_ap}
                    onCheckedChange={(checked) =>
                      setEditingCourse({ ...editingCourse, is_ap: checked })
                    }
                  />
                  <Label htmlFor="edit-is-ap">
                    This is an Advanced Placement course
                  </Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={updateCourse}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <div className="py-4">
              <div className="rounded-lg border p-4">
                <h4 className="font-medium">{editingCourse.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {editingCourse.code}
                </p>
                <p className="text-sm text-muted-foreground">
                  {editingCourse.semester} {editingCourse.year}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteCourse}>
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
