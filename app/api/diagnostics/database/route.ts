import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase with service role key (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export async function GET(request: NextRequest) {
  try {
    // Create Supabase admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check connection
    const connectionCheck = await supabase.from("courses").select("count").limit(1)
    const connected = !connectionCheck.error

    // Get tables info
    const { data: tablesData, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    if (tablesError) {
      return NextResponse.json({ error: `Failed to get tables: ${tablesError.message}` }, { status: 500 })
    }

    // Get tables with details
    const tables = []
    for (const table of tablesData || []) {
      const tableName = table.table_name

      // Get columns for this table
      const { data: columnsData } = await supabase
        .from("information_schema.columns")
        .select("column_name, data_type")
        .eq("table_schema", "public")
        .eq("table_name", tableName)

      tables.push({
        name: tableName,
        exists: true,
        columns: columnsData?.map((col) => ({
          name: col.column_name,
          type: col.data_type,
        })),
      })
    }

    // Get RLS policies
    const { data: policiesData, error: policiesError } = await supabase.from("pg_policies").select("*")

    if (policiesError) {
      return NextResponse.json({ error: `Failed to get policies: ${policiesError.message}` }, { status: 500 })
    }

    // Format policies
    const policies = (policiesData || []).map((policy) => ({
      table: policy.tablename,
      name: policy.policyname,
      enabled: true, // If it's in pg_policies, it's enabled
      definition: policy.qual,
      command: policy.cmd,
      permissive: policy.permissive === "YES",
    }))

    // Return diagnostics data
    return NextResponse.json({
      tables,
      policies,
      connection: {
        connected,
        url: supabaseUrl,
      },
    })
  } catch (err) {
    console.error("Diagnostics API error:", err)
    return NextResponse.json({ error: "An unexpected error occurred during diagnostics" }, { status: 500 })
  }
}
