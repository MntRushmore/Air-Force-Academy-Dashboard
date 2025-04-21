import { NextResponse } from "next/server";
import type { FitnessRecord, NewFitnessRecord } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: user, error: userError } = await supabase.auth.getUser();

    if (!user || userError) throw new Error("User not found");

    const { data: records, error } = await supabase
      .from("fitness_records")
      .select("*")
      .eq("user_id", user.user?.id)
      .order("date", { ascending: false });

    if (error) throw error;

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching fitness records:", error);
    return NextResponse.json(
      { error: "Error fetching fitness records" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const record: NewFitnessRecord = await request.json();

    const { data: user, error: userError } = await supabase.auth.getUser();

    if (!user || userError) throw new Error("User not found");

    const { data, error } = await supabase
      .from("fitness_records")
      .insert([{ ...record, user_id: user.user?.id }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating fitness record:", error);
    return NextResponse.json(
      { error: "Error creating fitness record" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { id, ...record }: Partial<FitnessRecord> = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Record ID is required" },
        { status: 400 }
      );
    }

    const { data: user, error: userError } = await supabase.auth.getUser();

    if (!user || userError) throw new Error("User not found");

    const { data, error } = await supabase
      .from("fitness_records")
      .update(record)
      .eq("id", id)
      .eq("user_id", user.user?.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating fitness record:", error);
    return NextResponse.json(
      { error: "Error updating fitness record" },
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
        { error: "Record ID is required" },
        { status: 400 }
      );
    }
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (!user || userError) throw new Error("User not found");

    const { error } = await supabase
      .from("fitness_records")
      .delete()
      .eq("id", id)
      .eq("user_id", user.user?.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fitness record:", error);
    return NextResponse.json(
      { error: "Error deleting fitness record" },
      { status: 500 }
    );
  }
}
