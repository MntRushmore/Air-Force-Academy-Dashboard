import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getClientId } from "@/lib/supabase-client"
import type { Database } from "@/lib/database.types"

// Initialize Supabase with service role key (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const gradeData = await request.json()

    // Create Supabase admin client with service role key
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Add client_id to the data
    const clientId = getClientId()
    const dataWithClientId = {
      ...gradeData,
      client_id: clientId !== "server-side" ? clientId : request.headers.get("x-client-id") || "api-client",
    }

    // Insert the grade using service role (bypassing RLS)
    const { data, error } = await supabase.from("grades").insert(dataWithClientId).select().single()

    if (error) {
      console.error("API error inserting grade:", error)
      return NextResponse.json({ error: `Failed to insert grade: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error("Unexpected API error:", err)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    // Create Supabase admin client with service role key
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Build query
    let query = supabase.from("grades").select("*")

    // Filter by course_id if provided
    if (courseId) {
      query = query.eq("course_id", courseId)
    }

    // Execute query
    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("API error fetching grades:", error)
      return NextResponse.json({ error: `Failed to fetch grades: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error("Unexpected API error:", err)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Grade ID is required" }, { status: 400 })
    }

    // Create Supabase admin client with service role key
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Delete the grade (bypassing RLS)
    const { error } = await supabase.from("grades").delete().eq("id", id)

    if (error) {
      console.error("API error deleting grade:", error)
      return NextResponse.json({ error: `Failed to delete grade: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Unexpected API error:", err)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
