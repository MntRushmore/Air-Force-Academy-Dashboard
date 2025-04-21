import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { FitnessGoal, NewFitnessGoal } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: goals, error } = await supabase
      .from("fitness_goals")
      .select("*")
      .order("target_date", { ascending: true });

    if (error) throw error;

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching fitness goals:", error);
    return NextResponse.json(
      { error: "Error fetching fitness goals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const goal: NewFitnessGoal = await request.json();

    const { data, error } = await supabase
      .from("fitness_goals")
      .insert([goal])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating fitness goal:", error);
    return NextResponse.json(
      { error: "Error creating fitness goal" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { id, ...goal }: Partial<FitnessGoal> = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("fitness_goals")
      .update(goal)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating fitness goal:", error);
    return NextResponse.json(
      { error: "Error updating fitness goal" },
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
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("fitness_goals")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fitness goal:", error);
    return NextResponse.json(
      { error: "Error deleting fitness goal" },
      { status: 500 }
    );
  }
}
