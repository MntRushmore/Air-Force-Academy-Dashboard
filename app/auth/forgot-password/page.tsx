"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const resetMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const email = formData.get("email") as string;
      return resetPassword(email);
    },
    onSuccess: (error) => {
      if (!error) {
        router.push("/auth/check-email");
      }
    },
  });

  const onSubmit = (formData: FormData) => {
    resetMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px] border-none shadow-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Forgot password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </CardDescription>
        </CardHeader>
        <form action={onSubmit}>
          <CardContent className="space-y-4 pt-0">
            {(resetMutation.error || resetMutation.data?.message) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {resetMutation.error?.message ||
                    resetMutation.data?.message ||
                    "Failed to send reset link"}
                </AlertDescription>
              </Alert>
            )}
            {resetMutation.isSuccess && !resetMutation.data && (
              <Alert>
                <AlertDescription>
                  Check your email for a password reset link
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="border-input bg-background"
                disabled={resetMutation.isPending}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <Button
              type="submit"
              className="w-full"
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/auth/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
