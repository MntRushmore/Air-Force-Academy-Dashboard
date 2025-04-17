import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, FileSpreadsheet, Cloud, RefreshCw } from "lucide-react"

export function ComingSoonFeatures() {
  const features = [
    {
      title: "Google Classroom Integration",
      description: "Import courses, assignments, and grades directly from Google Classroom",
      icon: BookOpen,
      eta: "Q2 2023",
    },
    {
      title: "School Portal Connection",
      description: "Connect to your school portal to import official grades and transcripts",
      icon: FileSpreadsheet,
      eta: "Q3 2023",
    },
    {
      title: "Cloud Synchronization",
      description: "Sync your data across multiple devices with cloud storage",
      icon: Cloud,
      eta: "Q3 2023",
    },
    {
      title: "Automatic Grade Updates",
      description: "Receive automatic updates when new grades are posted",
      icon: RefreshCw,
      eta: "Q4 2023",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coming Soon</CardTitle>
        <CardDescription>Features that are currently in development</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature, index) => (
            <div key={index} className="flex space-x-4 items-start p-4 rounded-lg border bg-card">
              <div className="mt-0.5">
                <feature.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center">
                  <h3 className="font-medium">{feature.title}</h3>
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {feature.eta}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
