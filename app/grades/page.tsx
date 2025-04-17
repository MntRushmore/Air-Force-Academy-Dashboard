"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PDFGradeUploader } from "@/components/pdf-grade-uploader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, BarChart } from "lucide-react"

export default function GradesPage() {
  const [activeTab, setActiveTab] = useState("import")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Grade Management</h1>
        <p className="text-muted-foreground">Import, analyze, and manage your academic grades</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">
            <Upload className="mr-2 h-4 w-4" />
            Import Grades
          </TabsTrigger>
          <TabsTrigger value="analyze">
            <BarChart className="mr-2 h-4 w-4" />
            Grade Analysis
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">PDF Import</CardTitle>
                <CardDescription>Extract grades from PDF reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Primary Method</div>
                <p className="text-xs text-muted-foreground mt-1">Supports various PDF formats</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CSV Import</CardTitle>
                <CardDescription>Import grades from spreadsheets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Alternative</div>
                <p className="text-xs text-muted-foreground mt-1">For structured data formats</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Manual Entry</CardTitle>
                <CardDescription>Add grades by hand</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Fallback</div>
                <p className="text-xs text-muted-foreground mt-1">When automated methods fail</p>
              </CardContent>
            </Card>
          </div>

          <PDFGradeUploader />
        </TabsContent>

        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grade Analysis</CardTitle>
              <CardDescription>Visualize and analyze your academic performance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">This feature will be available after importing your grades.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grade Reports</CardTitle>
              <CardDescription>Generate and export grade reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">This feature will be available after importing your grades.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
