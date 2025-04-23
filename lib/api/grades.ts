import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/lib/database.types";
import {
  Course,
  Grade,
  mapDbCourseToFrontend,
  mapDbGradeToFrontend,
} from "@/lib/types";
import { useAuth } from "../hooks/use-auth";

const supabase = createClient();

export function useCourses() {
  const user = useAuth();
  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!user) {
        throw new Error("User not found");
      }
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", user.user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(mapDbCourseToFrontend);
    },
  });
}
