import { type NextRequest, NextResponse } from "next/server"
import { importAllGoogleClassroomData } from "@/lib/google-classroom"

export async function POST(request: NextRequest) {
  // Get the access token from the cookie
  const accessToken = request.cookies.get("google_access_token")?.value

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated with Google Classroom" }, { status: 401 })
  }

  try {
    // Import all Google Classroom data
    const result = await importAllGoogleClassroomData(accessToken)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Error importing Google Classroom data:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
