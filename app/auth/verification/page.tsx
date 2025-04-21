import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px] border-none shadow-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            We&apos;ve sent you a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <p className="text-sm text-muted-foreground text-center">
            Please check your email and click the verification link to complete
            your registration. Once verified, you will be redirected to the
            dashboard.
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
