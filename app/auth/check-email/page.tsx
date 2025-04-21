"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px] border-none shadow-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            We&apos;ve sent you a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <p className="text-sm text-muted-foreground text-center">
            Please check your email for a password reset link. Click the link to
            reset your password. If you don&apos;t see the email, check your
            spam folder.
          </p>
          <div className="flex justify-center">
            <Link href="/auth/login">
              <Button variant="outline" className="border-input bg-background">
                Back to login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
