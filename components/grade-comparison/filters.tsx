"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";

interface FiltersProps {
  courses: Course[];
  selectedCourses: string[];
  setSelectedCourses: (courses: string[]) => void;
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  chartType: string;
  setChartType: (chartType: string) => void;
}

export function GradeComparisonFilters({
  courses,
  selectedCourses,
  setSelectedCourses,
  timeframe,
  setTimeframe,
  chartType,
  setChartType,
}: FiltersProps) {
  const [open, setOpen] = useState(false);

  const toggleCourse = (courseId: string) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter((id) => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  const selectAllCourses = () => {
    setSelectedCourses(courses.map((course) => course.id));
  };

  const clearCourseSelection = () => {
    setSelectedCourses([]);
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Courses:</span>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="justify-between min-w-[200px]"
              >
                {selectedCourses.length === 0
                  ? "Select courses..."
                  : `${selectedCourses.length} selected`}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px]">
              <Command>
                <CommandInput placeholder="Search courses..." />
                <CommandList>
                  <CommandEmpty>No course found.</CommandEmpty>
                  <div className="flex items-center p-2 border-b">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAllCourses}
                      className="mr-2"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCourseSelection}
                    >
                      Clear
                    </Button>
                  </div>
                  <CommandGroup>
                    {courses.map((course) => (
                      <CommandItem
                        key={course.id}
                        value={course.id}
                        onSelect={() => toggleCourse(course.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCourses.includes(course.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {course.code} - {course.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Timeframe:</span>
          <Tabs
            value={timeframe}
            onValueChange={setTimeframe}
            className="w-[200px]"
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="semester">Semester</TabsTrigger>
              <TabsTrigger value="quarter">Quarter</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Chart Type:</span>
        <Tabs
          value={chartType}
          onValueChange={setChartType}
          className="w-[300px]"
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="line">Line Chart</TabsTrigger>
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
