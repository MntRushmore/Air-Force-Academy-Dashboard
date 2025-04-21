import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) throw userError;

    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", user.user.id)
      .order("date", { ascending: true });

    if (error) throw error;

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching events" },
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

    const { data: event, error } = await supabase
      .from("events")
      .insert([{ ...data, user_id: user.user.id }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating event" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const data = await request.json();

    console.log({ data });

    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) throw userError;

    const {
      id,
      originalStartTime,
      originalEndTime,
      created_at,
      updated_at,
      ...rest
    } = data;

    const { data: event, error } = await supabase
      .from("events")
      .update({ ...rest, user_id: user.user.id })
      .eq("id", id)
      .eq("user_id", user.user.id)
      .select()
      .single();

    console.log({ event, error });

    if (error) throw error;

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) throw userError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)
      .eq("user_id", user.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting event" },
      { status: 500 }
    );
  }
}
