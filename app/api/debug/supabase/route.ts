import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-client"

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    // Check connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from("courses")
      .select("count()", { count: "exact" })

    if (connectionError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to connect to Supabase",
          error: connectionError,
        },
        { status: 500 },
      )
    }

    // Get table structure
    const { data: tableInfo, error: tableError } = await supabase.rpc("get_table_info", { table_name: "courses" })

    // Get sample data
    const { data: sampleData, error: dataError } = await supabase.from("courses").select("*").limit(5)

    return NextResponse.json({
      status: "success",
      connection: "Connected to Supabase",
      tableCount: connectionTest?.[0]?.count || 0,
      tableInfo: tableInfo || "Unable to retrieve table info",
      tableInfoError: tableError,
      sampleData: sampleData || [],
      sampleDataError: dataError,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to debug Supabase connection",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
