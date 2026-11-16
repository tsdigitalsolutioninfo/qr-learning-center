import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { istDayRange } from '@/lib/utils/ist';

function first<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

const json = (body: object, status: number) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return json({ error: 'A bearer access token is required.' }, 401);
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return json({ error: 'Invalid or expired access token.' }, 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return json({ error: 'Unable to load admin profile.' }, 500);
  }
  if (!profile || profile.role !== 'admin' || !profile.is_active) {
    return json({ error: 'Account is not an active admin.' }, 403);
  }

  const { start, end } = istDayRange();
  const students = () =>
    supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .is('archived_at', null);
  const calls = () =>
    supabase
      .from('call_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', start)
      .lt('created_at', end);
  const pendingFollowUps = () =>
    supabase
      .from('follow_ups')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

  const counts = await Promise.all([
    students(),
    students().is('last_call_at', null),
    students().eq('interest_status', 'interested'),
    students().eq('interest_status', 'not_interested'),
    calls(),
    calls().eq('call_status', 'connected'),
    pendingFollowUps().gte('due_at', start).lt('due_at', end),
    pendingFollowUps().lt('due_at', start),
  ]);
  if (counts.some((result) => result.error)) {
    return json({ error: 'Unable to load admin dashboard statistics.' }, 500);
  }

  const recentResult = await supabase
    .from('call_logs')
    .select(
      'id, student_id, call_status, interest_status, created_at, students(student_name, blocks(name)), profiles!call_logs_called_by_fkey(full_name)',
    )
    .order('created_at', { ascending: false })
    .limit(10);

  if (recentResult.error) {
    return json({ error: 'Unable to load recent call activity.' }, 500);
  }

  const recentCallActivity = recentResult.data.map((call) => {
    const student = first(call.students);
    return {
      id: call.id,
      student_id: call.student_id,
      student_name: student?.student_name ?? null,
      block_name: first(student?.blocks)?.name ?? null,
      caller_name: first(call.profiles)?.full_name ?? null,
      call_status: call.call_status,
      interest_status: call.interest_status,
      created_at: call.created_at,
    };
  });

  return json(
    {
      admin: {
        id: profile.id,
        full_name: profile.full_name,
        must_change_password:
          user.app_metadata?.must_change_password === true,
      },
      stats: {
        total_students: counts[0].count ?? 0,
        not_yet_contacted: counts[1].count ?? 0,
        interested: counts[2].count ?? 0,
        not_interested: counts[3].count ?? 0,
        calls_today: counts[4].count ?? 0,
        connected_today: counts[5].count ?? 0,
        follow_ups_due_today: counts[6].count ?? 0,
        overdue_follow_ups: counts[7].count ?? 0,
      },
      recent_call_activity: recentCallActivity,
    },
    200,
  );
}
