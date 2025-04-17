import { PDFGradeUploader } from "@/components/pdf-grade-uploader"

export default function GradesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Grade Import</h1>
        <p className="text-muted-foreground">Upload your PDF grade reports to import your grades into the dashboard</p>
      </div>

      <div className="grid gap-6">
        <PDFGradeUploader />
      </div>
    </div>
  )
}
