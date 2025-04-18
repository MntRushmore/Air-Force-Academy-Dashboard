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
    const courseData = await request.json()

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
      ...courseData,
      client_id: clientId !== "server-side" ? clientId : request.headers.get("x-client-id") || "api-client",
    }

    // Insert the course using service role (bypasses RLS)
    const { data, error } = await supabase.from("courses").insert(dataWithClientId).select().single()

    if (error) {
      console.error("API error inserting course:", error)
      return NextResponse.json(
        { error: `Failed to insert course: ${error.message}, code: ${error.code}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error("Unexpected API error:", err)
    return NextResponse.json({ error: `An unexpected error occurred: ${err.message}` }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Create Supabase admin client with service role key
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get all courses (bypassing RLS)
    const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("API error fetching courses:", error)
      return NextResponse.json(
        { error: `Failed to fetch courses: ${error.message}, code: ${error.code}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error("Unexpected API error:", err)
    return NextResponse.json({ error: `An unexpected error occurred: ${err.message}` }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Create Supabase admin client with service role key
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Delete the course (bypassing RLS)
    const { error } = await supabase.from("courses").delete().eq("id", id)

    if (error) {
      console.error("API error deleting course:", error)
      return NextResponse.json(
        { error: `Failed to delete course: ${error.message}, code: ${error.code}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Unexpected API error:", err)
    return NextResponse.json({ error: `An unexpected error occurred: ${err.message}` }, { status: 500 })
  }
}
