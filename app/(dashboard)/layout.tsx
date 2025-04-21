import type React from "react";
import type { Metadata } from "next";

import { SidebarProvider } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "USAFA Application Dashboard",
  description: "Track your USAFA application progress",
  generator: "v0.dev",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <SidebarProvider>{children}</SidebarProvider>
      <Toaster />
    </ThemeProvider>
  );
}
