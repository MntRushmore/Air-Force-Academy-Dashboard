import { type NextRequest, NextResponse } from "next/server"

// Google OAuth 2.0 configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`

export async function GET(request: NextRequest) {
  // Get the authorization code and state from the query parameters
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  // Get the stored state from the cookie
  const storedState = request.cookies.get("google_auth_state")?.value

  // Verify the state to prevent CSRF attacks
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/settings?error=invalid_state", request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/settings?error=no_code", request.url))
  }

  try {
    // Exchange the authorization code for access and refresh tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error("Token exchange error:", errorData)
      return NextResponse.redirect(new URL("/settings?error=token_exchange", request.url))
    }

    const tokenData = await tokenResponse.json()

    // Store the tokens securely
    // In a real app, you would store these in a database associated with the user
    // For this example, we'll store them in cookies (not recommended for production)
    const response = NextResponse.redirect(new URL("/settings?success=true", request.url))

    // Set cookies with the tokens
    response.cookies.set("google_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokenData.expires_in,
      path: "/",
    })

    if (tokenData.refresh_token) {
      response.cookies.set("google_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      })
    }

    return response
  } catch (error) {
    console.error("Error in Google OAuth callback:", error)
    return NextResponse.redirect(new URL("/settings?error=server_error", request.url))
  }
}
