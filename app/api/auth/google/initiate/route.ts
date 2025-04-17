import { NextResponse } from "next/server"

// Google OAuth 2.0 configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`

// Scopes needed for Google Classroom access
const SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly",
]

export async function GET() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.json({ error: "Google OAuth credentials not configured" }, { status: 500 })
  }

  // Create the OAuth 2.0 authorization URL
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID)
  authUrl.searchParams.append("redirect_uri", REDIRECT_URI)
  authUrl.searchParams.append("response_type", "code")
  authUrl.searchParams.append("scope", SCOPES.join(" "))
  authUrl.searchParams.append("access_type", "offline")
  authUrl.searchParams.append("prompt", "consent")

  // Generate a state parameter to prevent CSRF attacks
  const state = Math.random().toString(36).substring(2)
  authUrl.searchParams.append("state", state)

  // Store the state in a cookie for verification in the callback
  const response = NextResponse.json({ authUrl: authUrl.toString() })
  response.cookies.set("google_auth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  })

  return response
}
