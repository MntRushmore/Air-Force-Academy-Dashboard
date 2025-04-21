"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { updatePassword } from "../actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();

  const resetMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const password = formData.get("password") as string;
      return updatePassword(password);
    },
    onSuccess: (error) => {
      if (!error) {
        router.push("/auth/login?message=Password updated successfully");
      }
    },
  });

  const onSubmit = (formData: FormData) => {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      resetMutation.setError(new Error("Passwords do not match"));
      return;
    }

    resetMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px] border-none shadow-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Reset password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your new password
          </CardDescription>
        </CardHeader>
        <form action={onSubmit}>
          <CardContent className="space-y-4 pt-0">
            {(resetMutation.error || resetMutation.data?.message) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {resetMutation.error?.message ||
                    resetMutation.data?.message ||
                    "Failed to reset password"}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your new password"
                required
                className="border-input bg-background"
                disabled={resetMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
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
                  Updating password...
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
