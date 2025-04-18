import type React from "react"
import { AlertCircle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ComingSoonFeatureProps {
  title: string
  description: string
  icon?: React.ReactNode
  buttonText?: string
}

export function ComingSoonFeature({ title, description, icon, buttonText }: ComingSoonFeatureProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-yellow-500 text-xs text-black font-medium py-1 px-2 rounded-bl-md">
        Coming Soon
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Feature in development</AlertTitle>
          <AlertDescription>This feature is currently in development and will be available soon.</AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button disabled className="w-full">
          {buttonText || "Coming Soon"}
        </Button>
      </CardFooter>
    </Card>
  )
}
