"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";

interface Assignment {
  id: string;
  course_id: string;
  title: string;
  max_score: number;
  weight: number;
  due_date: string;
  created_at: string;
}

export function useAssignments(courseId: string) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const loadAssignments = async () => {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("course_id", courseId)
        .order("due_date", { ascending: true });

      if (error) {
        console.error("Failed to fetch assignments:", error);
        setError(error.message);
      } else {
        setAssignments(data || []);
      }

      setLoading(false);
    };

    loadAssignments();
  }, [courseId]);

  const addAssignment = async (newAssignment: Omit<Assignment, "id" | "created_at">) => {
    setError(null);
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("assignments")
      .insert(newAssignment)
      .select()
      .single();

    if (error) {
      console.error("Failed to insert assignment:", error);
      setError(error.message);
    } else if (data) {
      setAssignments((prev) => [...prev, data]);
    }
  };

  return { assignments, loading, error, addAssignment };
}