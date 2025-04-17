"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getClientId } from "@/lib/supabase-client"

export function DatabaseDiagnostics() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const clientId = getClientId()

  const runDiagnostics = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/diagnostics/database", {
        headers: {
          "x-client-id": clientId,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Diagnostics failed")
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      console.error("Diagnostics error:", err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Diagnostics</CardTitle>
        <CardDescription>Check your Supabase database configuration and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <Tabs defaultValue="tables">
            <TabsList>
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="policies">RLS Policies</TabsTrigger>
              <TabsTrigger value="connection">Connection</TabsTrigger>
            </TabsList>

            <TabsContent value="tables" className="space-y-4">
              <h3 className="text-lg font-medium">Database Tables</h3>
              {results.tables.map((table: any) => (
                <div key={table.name} className="border p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{table.name}</h4>
                    <Badge variant={table.exists ? "success" : "destructive"}>
                      {table.exists ? "Exists" : "Missing"}
                    </Badge>
                  </div>
                  {table.columns && (
                    <div className="mt-2">
                      <h5 className="text-sm font-medium mb-1">Columns:</h5>
                      <div className="grid grid-cols-3 gap-1 text-sm">
                        {table.columns.map((col: any) => (
                          <div key={col.name} className="flex items-center gap-1">
                            <span>{col.name}</span>
                            <span className="text-xs text-muted-foreground">({col.type})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="policies" className="space-y-4">
              <h3 className="text-lg font-medium">Row-Level Security Policies</h3>
              {results.policies.map((policy: any) => (
                <div key={`${policy.table}-${policy.name}`} className="border p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{policy.table}</h4>
                    <Badge>{policy.enabled ? "RLS Enabled" : "RLS Disabled"}</Badge>
                  </div>
                  <div className="mt-2">
                    <h5 className="text-sm font-medium">{policy.name}</h5>
                    <p className="text-sm text-muted-foreground">{policy.definition}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{policy.command}</Badge>
                      <Badge variant="outline">{policy.permissive ? "Permissive" : "Restrictive"}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="connection">
              <h3 className="text-lg font-medium mb-3">Connection Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Connection Status:</span>
                  <Badge variant={results.connection.connected ? "success" : "destructive"}>
                    {results.connection.connected ? "Connected" : "Failed"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Client ID:</span>
                  <span>{clientId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Project URL:</span>
                  <span className="truncate max-w-[200px]">{results.connection.url || "Not available"}</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={runDiagnostics} disabled={loading}>
          {loading ? "Running Diagnostics..." : "Run Diagnostics"}
        </Button>
      </CardFooter>
    </Card>
  )
}
