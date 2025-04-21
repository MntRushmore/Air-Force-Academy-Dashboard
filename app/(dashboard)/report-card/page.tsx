import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PDFUpload } from "@/components/pdf-upload"
import { ReportCardDisplay } from "@/components/report-card-display"
import { ReportCardSummary } from "@/components/report-card-summary"
import { FileText, PieChart } from "lucide-react"

export default function ReportCardPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Report Card</h1>
        <p className="text-muted-foreground">View and analyze your academic performance</p>
      </div>

      <PDFUpload />

      <Tabs defaultValue="report" className="space-y-4">
        <TabsList>
          <TabsTrigger value="report">
            <FileText className="mr-2 h-4 w-4" />
            Report Card
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <PieChart className="mr-2 h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>
        <TabsContent value="report" className="space-y-4">
          <ReportCardDisplay />
        </TabsContent>
        <TabsContent value="analysis" className="space-y-4">
          <ReportCardSummary />
        </TabsContent>
      </Tabs>
    </div>
  )
}
