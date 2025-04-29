import { getSupabaseClient } from '@/lib/supabase-client';

const supabase = getSupabaseClient();

// Fetch all assignments
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return new Response(JSON.stringify({ error: 'Missing courseId' }), { status: 400 });
  }

  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('course_id', courseId)
    .order('due_date', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}

// Create a new assignment
export async function POST(request: Request) {
  const body = await request.json();

  const { title, course_id, max_score, weight, due_date } = body;

  if (!title || !course_id) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const { data, error } = await supabase
    .from('assignments')
    .insert([
      {
        title,
        course_id,
        max_score,
        weight,
        due_date,
        created_at: new Date().toISOString(),
      }
    ]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}