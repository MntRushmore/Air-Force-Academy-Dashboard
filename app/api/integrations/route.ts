import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: integrations, error } = await supabase
      .from("integrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(integrations);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching integrations" },
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

    const { data: integration, error } = await supabase
      .from("integrations")
      .insert([{ ...data, user_id: user.user.id }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(integration);
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating integration" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const data = await request.json();
    const { id, ...rest } = data;

    const { data: integration, error } = await supabase
      .from("integrations")
      .update(rest)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(integration);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating integration" },
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
        { error: "Integration ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("integrations").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting integration" },
      { status: 500 }
    );
  }
}
