"use client"

import { useState } from "react"
import { PDFGradeUploader } from "@/components/pdf-grade-uploader"

export default function GradesPage() {
  const [activeTab, setActiveTab] = useState("import")

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Grades</h1>
        <p className="text-muted-foreground">Upload your grade reports and track your academic performance</p>
      </div>

      <div className="grid gap-6">
        <PDFGradeUploader />
      </div>
    </div>
  )
}
