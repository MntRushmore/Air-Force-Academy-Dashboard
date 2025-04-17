"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react"

interface ResourceStatus {
  url: string
  status: "loading" | "success" | "error"
  timeMs?: number
}

export function ResourceDiagnostics() {
  const [resources, setResources] = useState<ResourceStatus[]>([
    { url: "/digital-classroom-icon.png", status: "loading" },
    { url: "/digital-schoolhouse.png", status: "loading" },
    { url: "/placeholder.svg", status: "loading" },
  ])
  const [isChecking, setIsChecking] = useState(false)

  const checkResources = async () => {
    setIsChecking(true)

    const newStatuses = [...resources]

    for (let i = 0; i < newStatuses.length; i++) {
      const resource = newStatuses[i]
      resource.status = "loading"
      setResources([...newStatuses])

      try {
        const startTime = performance.now()
        const response = await fetch(resource.url, { method: "HEAD" })
        const endTime = performance.now()

        if (response.ok) {
          newStatuses[i] = {
            ...resource,
            status: "success",
            timeMs: Math.round(endTime - startTime),
          }
        } else {
          newStatuses[i] = {
            ...resource,
            status: "error",
          }
        }
      } catch (error) {
        newStatuses[i] = {
          ...resource,
          status: "error",
        }
      }

      setResources([...newStatuses])
    }

    setIsChecking(false)
  }

  useEffect(() => {
    checkResources()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Diagnostics</CardTitle>
        <CardDescription>Check if critical resources are loading correctly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {resources.map((resource, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <span className="font-mono text-sm truncate max-w-[250px]">{resource.url}</span>
              <div className="flex items-center">
                {resource.status === "loading" && <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />}
                {resource.status === "success" && (
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground mr-2">{resource.timeMs}ms</span>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                )}
                {resource.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
              </div>
            </div>
          ))}
        </div>

        {resources.some((r) => r.status === "error") && (
          <Alert variant="destructive">
            <AlertTitle>Resource Loading Issues Detected</AlertTitle>
            <AlertDescription>
              Some resources failed to load. This may affect the application's functionality. Try refreshing the page or
              contact support if the issue persists.
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={checkResources} disabled={isChecking} className="w-full">
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking Resources...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Resources Again
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
