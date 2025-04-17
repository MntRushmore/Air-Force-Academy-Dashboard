import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DataProvider } from "@/lib/data-context"
import { DataLoading } from "@/components/data-loading"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "USAFA Application Dashboard",
  description: "Track your courses, grades, and schedule",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DataProvider>
            <DataLoading>{children}</DataLoading>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'