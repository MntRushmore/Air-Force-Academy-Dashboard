"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

function LoginPageContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null); // Add ref for email input

  // Automatically focus email input field when page loads
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      alert("Login failed: " + error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 p-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <Input
        ref={emailInputRef} // Focus the email input field
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="max-w-sm"
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="max-w-sm"
      />
      <Button onClick={handleLogin} disabled={loading} className="mt-4">
        {loading ? "Logging in..." : "Log in"}
      </Button>
    </div>
  );
}

export default function LoginPage() {
  return <LoginPageContent />;
}
