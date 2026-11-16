import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { istDayRange } from '@/lib/utils/ist';

type ActionStudent = {
  student_name: string | null;
  phone_number: string | null;
  class_name: string | null;
  last_call_status: string | null;
  blocks: { name: string | null } | { name: string | null }[] | null;
};

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
    .select('id, full_name, role, is_active, district_id, block_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return json({ error: 'Unable to load correspondent profile.' }, 500);
  }
  if (!profile || profile.role !== 'block_correspondence' || !profile.is_active) {
    return json({ error: 'Account is not an active correspondent.' }, 403);
  }
  const { start, end } = istDayRange();
  const students = () => supabase.from('students').select('id', { count: 'exact', head: true }).is('archived_at', null);
  const calls = () => supabase.from('call_logs').select('id', { count: 'exact', head: true }).gte('created_at', start).lt('created_at', end);
  const pendingFollowUps = () => supabase.from('follow_ups').select('id', { count: 'exact', head: true }).eq('status', 'pending');

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
    return json({ error: 'Unable to load dashboard statistics.' }, 500);
  }

  const [followUpsResult, callbacksResult, uncontactedResult, recentResult] = await Promise.all([
    supabase.from('follow_ups')
      .select('student_id, due_at, students(student_name, phone_number, class_name, last_call_status, blocks(name))')
      .eq('status', 'pending').lt('due_at', end).order('due_at').limit(20),
    supabase.from('students')
      .select('id, student_name, phone_number, class_name, last_call_status, blocks(name)')
      .is('archived_at', null).eq('last_call_status', 'call_back_requested').limit(10),
    supabase.from('students')
      .select('id, student_name, phone_number, class_name, last_call_status, blocks(name)')
      .is('archived_at', null).is('last_call_at', null).limit(10),
    supabase.from('call_logs')
      .select('id, student_id, call_status, interest_status, created_at, students(student_name, blocks(name)), profiles!call_logs_called_by_fkey(full_name)')
      .order('created_at', { ascending: false }).limit(10),
  ]);
  if (followUpsResult.error || callbacksResult.error || uncontactedResult.error || recentResult.error) {
    return json({ error: 'Unable to load dashboard activity.' }, 500);
  }

  const needsAction: {
    student_id: string;
    student_name: string;
    reason: string;
    phone_number: string | null;
    class_name: string | null;
    block_name: string | null;
    last_call_status: string | null;
  }[] = [];
  const seen = new Set<string>();
  const addAction = (studentId: string, student: ActionStudent | null, reason: string) => {
    if (!student || seen.has(studentId)) return;
    seen.add(studentId);
    needsAction.push({
      student_id: studentId,
      student_name: student.student_name ?? 'Student',
      reason,
      phone_number: student.phone_number,
      class_name: student.class_name,
      block_name: first(student.blocks)?.name ?? null,
      last_call_status: student.last_call_status,
    });
  };

  for (const followUp of followUpsResult.data) {
    addAction(
      followUp.student_id,
      first(followUp.students) as ActionStudent | null,
      followUp.due_at < start ? 'Overdue follow-up' : 'Follow-up due today',
    );
  }
  for (const student of callbacksResult.data) {
    addAction(student.id, student as ActionStudent, 'Asked for a call back');
  }
  for (const student of uncontactedResult.data) {
    addAction(student.id, student as ActionStudent, 'Not yet contacted');
  }

  const recentCallActivity = recentResult.data.map((call) => {
    const student = first(call.students);
    const caller = first(call.profiles);
    return {
      id: call.id,
      student_id: call.student_id,
      student_name: student?.student_name ?? null,
      block_name: first(student?.blocks)?.name ?? null,
      caller_name: caller?.full_name ?? null,
      call_status: call.call_status,
      interest_status: call.interest_status,
      created_at: call.created_at,
    };
  });

  return json({
    correspondent: {
      id: profile.id,
      full_name: profile.full_name,
      role: profile.role,
      district_id: profile.district_id,
      block_id: profile.block_id,
    },
    stats: {
      students_in_my_block: counts[0].count ?? 0,
      not_yet_contacted: counts[1].count ?? 0,
      calls_today: counts[4].count ?? 0,
      connected_today: counts[5].count ?? 0,
      interested: counts[2].count ?? 0,
      not_interested: counts[3].count ?? 0,
      follow_ups_due_today: counts[6].count ?? 0,
      overdue_follow_ups: counts[7].count ?? 0,
    },
    needs_action: needsAction.slice(0, 15),
    recent_call_activity: recentCallActivity,
  }, 200);
}
