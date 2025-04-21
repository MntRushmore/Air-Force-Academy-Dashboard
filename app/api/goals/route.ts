import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    console.log("goals route");
    const supabase = await createClient();

    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data: goals, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.user.id)
      .order("created_at", { ascending: false });

    console.log({ goals, error });

    if (error) throw error;

    return NextResponse.json(goals);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching goals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const data = await request.json();

    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data: goal, error } = await supabase
      .from("goals")
      .insert([{ ...data, user_id: user.user.id }])
      .select()
      .single();

    console.log({ goal, error });

    if (error) throw error;

    return NextResponse.json(goal);
  } catch (error) {
    return NextResponse.json({ error: "Error creating goal" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const data = await request.json();
    const { id, ...rest } = data;
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data: goal, error } = await supabase
      .from("goals")
      .update(rest)
      .eq("id", id)
      .eq("user_id", user.user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(goal);
  } catch (error) {
    return NextResponse.json({ error: "Error updating goal" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    if (!id) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting goal" }, { status: 500 });
  }
}
