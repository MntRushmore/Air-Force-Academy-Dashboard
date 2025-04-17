import type React from "react"
import "./globals.css"
import ClientLayout from "./client-layout"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>USAFA Application Dashboard</title>
        <meta name="description" content="Track your USAFA application progress" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}


import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
