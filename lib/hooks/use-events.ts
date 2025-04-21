import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database } from "@/lib/database.types";
import { useAuth } from "./use-auth";
import { createClient } from "@/utils/supabase/client";

type Event = Database["public"]["Tables"]["events"]["Row"];
type NewEvent = Database["public"]["Tables"]["events"]["Insert"];
type UpdateEvent = Database["public"]["Tables"]["events"]["Update"];

export function useEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user?.id)
        .order("date", { ascending: true });

      console.log({ events });
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!user,
  });

  const createEvent = useMutation({
    mutationFn: async (newEvent: Omit<NewEvent, "id" | "user_id">) => {
      const { data, error } = await supabase
        .from("events")
        .insert([{ ...newEvent, user_id: user?.id }])
        .select()
        .single();
      console.log({ data, error });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateEvent & { id: string }) => {
      const { data, error } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
