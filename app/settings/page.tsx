"use client"

import { useState } from "react"
import { Download, FileUp, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/lib/db"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle")
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [importError, setImportError] = useState("")
  const [importFile, setImportFile] = useState<File | null>(null)
  const [resetConfirm, setResetConfirm] = useState(false)

  const handleExportData = async () => {
    try {
      // Collect all data from the database
      const tasks = await db.tasks.toArray()
      const events = await db.events.toArray()
      const journalEntries = await db.journalEntries.toArray()
      const meetingLogs = await db.meetingLogs.toArray()
      const mentors = await db.mentors.toArray()
      const questions = await db.questions.toArray()
      const exercises = await db.exercises.toArray()
      const goals = await db.goals.toArray()
      const courses = await db.courses.toArray()
      const grades = await db.grades.toArray()

      // Create a data object with all tables
      const data = {
        tasks,
        events,
        journalEntries,
        meetingLogs,
        mentors,
        questions,
        exercises,
        goals,
        courses,
        grades,
        exportDate: new Date().toISOString(),
        version: "1.0",
      }

      // Convert to JSON and create a blob
      const jsonData = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      // Create a download link and trigger it
      const a = document.createElement("a")
      a.href = url
      a.download = `usafa-dashboard-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportStatus("success")
      setTimeout(() => setExportStatus("idle"), 3000)
    } catch (error) {
      console.error("Export error:", error)
      setExportStatus("error")
      setTimeout(() => setExportStatus("idle"), 3000)
    }
  }

  const handleImportData = async () => {
    if (!importFile) return

    try {
      setImportStatus("idle")
      setImportError("")

      const fileContent = await importFile.text()
      const data = JSON.parse(fileContent)

      // Validate the data structure
      if (!data.version || !data.exportDate) {
        throw new Error("Invalid data format")
      }

      // Clear existing data
      await db.tasks.clear()
      await db.events.clear()
      await db.journalEntries.clear()
      await db.meetingLogs.clear()
      await db.mentors.clear()
      await db.questions.clear()
      await db.exercises.clear()
      await db.goals.clear()
      await db.courses.clear()
      await db.grades.clear()

      // Import data for each table
      if (data.tasks && Array.isArray(data.tasks)) {
        await db.tasks.bulkAdd(data.tasks)
      }
      if (data.events && Array.isArray(data.events)) {
        await db.events.bulkAdd(data.events)
      }
      if (data.journalEntries && Array.isArray(data.journalEntries)) {
        await db.journalEntries.bulkAdd(data.journalEntries)
      }
      if (data.meetingLogs && Array.isArray(data.meetingLogs)) {
        await db.meetingLogs.bulkAdd(data.meetingLogs)
      }
      if (data.mentors && Array.isArray(data.mentors)) {
        await db.mentors.bulkAdd(data.mentors)
      }
      if (data.questions && Array.isArray(data.questions)) {
        await db.questions.bulkAdd(data.questions)
      }
      if (data.exercises && Array.isArray(data.exercises)) {
        await db.exercises.bulkAdd(data.exercises)
      }
      if (data.goals && Array.isArray(data.goals)) {
        await db.goals.bulkAdd(data.goals)
      }
      if (data.courses && Array.isArray(data.courses)) {
        await db.courses.bulkAdd(data.courses)
      }
      if (data.grades && Array.isArray(data.grades)) {
        await db.grades.bulkAdd(data.grades)
      }

      setImportStatus("success")
      setImportFile(null)
      setTimeout(() => setImportStatus("idle"), 3000)
    } catch (error) {
      console.error("Import error:", error)
      setImportStatus("error")
      setImportError(error instanceof Error ? error.message : "Unknown error occurred")
      setTimeout(() => {
        setImportStatus("idle")
        setImportError("")
      }, 5000)
    }
  }

  const handleResetData = async () => {
    if (!resetConfirm) {
      setResetConfirm(true)
      return
    }

    try {
      // Clear all data
      await db.tasks.clear()
      await db.events.clear()
      await db.journalEntries.clear()
      await db.meetingLogs.clear()
      await db.mentors.clear()
      await db.questions.clear()
      await db.exercises.clear()
      await db.goals.clear()
      await db.courses.clear()
      await db.grades.clear()

      setResetConfirm(false)
      window.location.href = "/"
    } catch (error) {
      console.error("Reset error:", error)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your USAFA dashboard settings and data</p>
      </div>

      <Tabs defaultValue="data" className="space-y-4">
        <TabsList>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Download all your dashboard data as a JSON file for backup</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This will export all your courses, grades, goals, fitness data, and other information from your
                dashboard. You can use this file to restore your data later or transfer it to another device.
              </p>

              {exportStatus === "success" && (
                <Alert className="mb-4 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <AlertTitle>Export Successful</AlertTitle>
                  <AlertDescription>Your data has been exported successfully.</AlertDescription>
                </Alert>
              )}

              {exportStatus === "error" && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Export Failed</AlertTitle>
                  <AlertDescription>There was an error exporting your data. Please try again.</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleExportData} className="gap-2">
                <Download className="h-4 w-4" />
                Export All Data
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>Restore your dashboard data from a previously exported file</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Warning: Importing data will replace all your current dashboard information. Make sure you have a backup
                of your current data before proceeding.
              </p>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="import-file">JSON File</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImportFile(e.target.files[0])
                    }
                  }}
                />
              </div>

              {importStatus === "success" && (
                <Alert className="mt-4 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <AlertTitle>Import Successful</AlertTitle>
                  <AlertDescription>Your data has been imported successfully.</AlertDescription>
                </Alert>
              )}

              {importStatus === "error" && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Import Failed</AlertTitle>
                  <AlertDescription>{importError || "There was an error importing your data."}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleImportData} disabled={!importFile} className="gap-2">
                <FileUp className="h-4 w-4" />
                Import Data
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reset Data</CardTitle>
              <CardDescription>Clear all data and start fresh</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This will permanently delete all your dashboard data, including courses, grades, goals, fitness data,
                and other information. This action cannot be undone.
              </p>

              {resetConfirm && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Confirm Reset</AlertTitle>
                  <AlertDescription>
                    Are you sure you want to delete all your data? This action cannot be undone.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="destructive" onClick={handleResetData} className="gap-2">
                <Trash2 className="h-4 w-4" />
                {resetConfirm ? "Yes, Reset All Data" : "Reset All Data"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Customize the appearance of your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Your dashboard automatically follows your system theme preference. You can also manually toggle between
                light and dark mode using the theme toggle in the header.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About USAFA Dashboard</CardTitle>
              <CardDescription>Information about your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">USAFA Application Dashboard</h3>
                <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium">Features</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                  <li>Course and grade management</li>
                  <li>GPA calculator with AP course weighting</li>
                  <li>Candidate Fitness Assessment (CFA) tracker</li>
                  <li>Goal setting and progress tracking</li>
                  <li>Application timeline and milestones</li>
                  <li>Offline functionality with PWA support</li>
                  <li>Data import/export for backup and transfer</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium">About USAFA</h3>
                <p className="text-sm mt-2">
                  The United States Air Force Academy (USAFA) is a prestigious military academy that trains cadets to
                  become officers in the United States Air Force and Space Force. Located in Colorado Springs, Colorado,
                  USAFA offers a rigorous four-year program that combines academic excellence, military training, and
                  athletic development.
                </p>
                <p className="text-sm mt-2">
                  For more information, visit the{" "}
                  <a
                    href="https://www.usafa.edu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0033a0] hover:underline"
                  >
                    official USAFA website
                  </a>
                  .
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => window.open("https://www.usafa.edu/admissions/", "_blank")}>
                Visit USAFA Admissions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
