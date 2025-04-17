"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { IntegrationNotificationForm } from "@/components/integration-notification-form"
import Image from "next/image"

export function GoogleClassroomIntegration() {
  return (
    <Card className="w-full relative overflow-hidden">
      {/* Coming Soon Badge */}
      <div className="absolute right-0 top-0">
        <Badge
          variant="secondary"
          className="rounded-tl-none rounded-br-none rounded-tr-md rounded-bl-md bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-medium"
        >
          <Clock className="h-3 w-3 mr-1" />
          Coming Soon
        </Badge>
      </div>

      <CardHeader>
        <CardTitle className="flex items-center">
          Google Classroom Integration
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-80">This feature is currently in development and will be available soon.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>Connect to Google Classroom to import your courses, assignments, and grades</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center py-6 px-4">
          <div className="relative mx-auto mb-6 h-24 w-24 opacity-80">
            <div className="h-full w-full relative">
              <Image src="/digital-classroom-icon.png" alt="Google Classroom" fill className="object-contain" />
            </div>
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center rounded-full">
              <Clock className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>

          <h3 className="text-lg font-medium mb-2">Google Classroom Integration Coming Soon</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            We're working on integrating with Google Classroom to allow you to automatically import your courses,
            assignments, and grades. This feature will be available in a future update.
          </p>

          <IntegrationNotificationForm />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" disabled>
          Connect to Google Classroom
        </Button>
        <Button disabled>Import Data</Button>
      </CardFooter>

      {/* Overlay to indicate the feature is disabled */}
      <div className="absolute inset-0 bg-background/5 pointer-events-none" />
    </Card>
  )
}
