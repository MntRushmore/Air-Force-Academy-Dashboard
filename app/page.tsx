"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, Suspense, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";

function LandingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        toast({
          title: "Success",
          description: "You have been successfully signed in.",
        });
        router.push("/dashboard");
      }
    });

    const handleInitialRedirect = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };

    handleInitialRedirect();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 p-4">
      <h1 className="text-4xl font-bold text-center">
        Welcome to Air Force Academy Dashboard
      </h1>
      <p className="text-muted-foreground text-center max-w-md">
        Your comprehensive platform for managing academic progress, fitness
        goals, and application tracking.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button size="lg" onClick={() => router.push("/auth/login")}>
          Login
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => router.push("/auth/signup")}
        >
          Sign Up
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 text-sm text-muted-foreground">
        v0.1
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LandingPageContent />
    </Suspense>
  );
}
