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
  const [showForm, setShowForm] = useState(false); // Controls form visibility
  const [isSignUp, setIsSignUp] = useState(false); // Toggles between login and signup

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

      {/* Show buttons to trigger form display */}
      {!showForm ? (
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button size="lg" onClick={() => { setShowForm(true); setIsSignUp(false); }}>
            Login
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => { setShowForm(true); setIsSignUp(true); }}
          >
            Sign Up
          </Button>
        </div>
      ) : (
        // Display form based on sign-up or login
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full max-w-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full max-w-sm"
          />
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button size="lg" onClick={() => router.push("/auth/login")}>
              Login
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={async () => {
                setLoading(true);
                const supabase = createClient();
                const { data, error } = isSignUp
                  ? await supabase.auth.signUp({ email, password })
                  : await supabase.auth.signInWithPassword({ email, password });

                setLoading(false);

                if (error) {
                  console.error(error);
                  toast({
                    title: "Signup/Login failed",
                    description: error.message,
                    variant: "destructive",
                  });
                } else {
                  toast({
                    title: isSignUp ? "Signup successful!" : "Login successful!",
                    description: "Redirecting to dashboard...",
                  });
                  router.push("/dashboard");
                }
              }}
            >
              {loading ? <span className="loader"></span> : isSignUp ? "Sign Up" : "Login"}
            </Button>
          </div>
        </div>
      )}

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
