import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { WorkoutLog, NewWorkoutLog } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: workouts, error } = await supabase
      .from("workout_logs")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    return NextResponse.json(workouts);
  } catch (error) {
    console.error("Error fetching workout logs:", error);
    return NextResponse.json(
      { error: "Error fetching workout logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const workout: NewWorkoutLog = await request.json();

    const { data, error } = await supabase
      .from("workout_logs")
      .insert([workout])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating workout log:", error);
    return NextResponse.json(
      { error: "Error creating workout log" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    const { id, ...workout }: Partial<WorkoutLog> = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Workout ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("workout_logs")
      .update(workout)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating workout log:", error);
    return NextResponse.json(
      { error: "Error updating workout log" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Workout ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("workout_logs").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout log:", error);
    return NextResponse.json(
      { error: "Error deleting workout log" },
      { status: 500 }
    );
  }
}
