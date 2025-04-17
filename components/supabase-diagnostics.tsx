"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupabaseClient, getClientId, checkSupabaseConnection } from "@/lib/supabase-client"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export function SupabaseDiagnostics() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "success" | "error">("checking")
  const [tablesStatus, setTablesStatus] = useState<Record<string, "checking" | "success" | "error">>({
    courses: "checking",
    grades: "checking",
  })
  const [clientId, setClientId] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const id = getClientId()
    setClientId(id)

    checkConnection()
  }, [])

  const checkConnection = async () => {
    setConnectionStatus("checking")
    setErrorMessage("")

    try {
      const isConnected = await checkSupabaseConnection()
      setConnectionStatus(isConnected ? "success" : "error")

      if (isConnected) {
        checkTables()
      } else {
        setErrorMessage("Failed to connect to Supabase. Check your environment variables.")
      }
    } catch (err) {
      setConnectionStatus("error")
      setErrorMessage(err instanceof Error ? err.message : String(err))
    }
  }

  const checkTables = async () => {
    const supabase = getSupabaseClient()
    const tables = ["courses", "grades"]

    for (const table of tables) {
      setTablesStatus((prev) => ({ ...prev, [table]: "checking" }))

      try {
        const { data, error } = await supabase.from(table).select("count").limit(1)

        if (error) {
          setTablesStatus((prev) => ({ ...prev, [table]: "error" }))
          setErrorMessage((prev) => prev + `\n${table}: ${error.message}`)
        } else {
          setTablesStatus((prev) => ({ ...prev, [table]: "success" }))
        }
      } catch (err) {
        setTablesStatus((prev) => ({ ...prev, [table]: "error" }))
        setErrorMessage((prev) => prev + `\n${table}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  const getStatusIcon = (status: "checking" | "success" | "error") => {
    if (status === "checking") return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    if (status === "success") return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Diagnostics</CardTitle>
        <CardDescription>Check your Supabase connection and table access</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Connection Status:</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(connectionStatus)}
              <span>
                {connectionStatus === "checking"
                  ? "Checking..."
                  : connectionStatus === "success"
                    ? "Connected"
                    : "Failed"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>Client ID:</span>
            <span className="font-mono text-sm">{clientId}</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium">Tables:</h3>
            {Object.entries(tablesStatus).map(([table, status]) => (
              <div key={table} className="flex items-center justify-between pl-4">
                <span>{table}:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span>{status === "checking" ? "Checking..." : status === "success" ? "Accessible" : "Error"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="whitespace-pre-line">{errorMessage}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkConnection} className="w-full">
          Run Diagnostics Again
        </Button>
      </CardFooter>
    </Card>
  )
}
