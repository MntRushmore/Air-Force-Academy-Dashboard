"use client"

import { useData } from "@/lib/data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dumbbell, GraduationCap } from "lucide-react"

export function DashboardSummary() {
  const { gpa, cfaScore, courses, exercises } = useData()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{gpa}</div>
          <div className="mt-1 text-sm opacity-90">
            Based on {courses.length} course{courses.length !== 1 ? "s" : ""}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#7d8ca3] to-[#a1afc2] text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">CFA Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{cfaScore}/100</div>
          <div className="mt-1 text-sm opacity-90">
            Based on {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#0033a0] to-[#003db8] text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">AP Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{courses.filter((c) => c.isAP).length}</div>
          <div className="mt-1 text-sm opacity-90">
            {((courses.filter((c) => c.isAP).length / Math.max(courses.length, 1)) * 100).toFixed(0)}% of total courses
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#7d8ca3] to-[#a1afc2] text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <a href="/courses" className="flex items-center gap-2 text-sm hover:underline">
              <GraduationCap className="h-4 w-4" /> Manage Courses
            </a>
            <a href="/fitness" className="flex items-center gap-2 text-sm hover:underline">
              <Dumbbell className="h-4 w-4" /> Update Fitness
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
