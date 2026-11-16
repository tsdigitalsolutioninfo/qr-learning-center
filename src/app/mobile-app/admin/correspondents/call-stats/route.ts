import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { istDayRange } from '@/lib/utils/ist';
import { createAdminClient } from '@/lib/supabase/admin';

const json = (body: object, status: number) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

type CallStatsRow = {
  correspondent_id: string | null;
  full_name: string;
  is_active: boolean | null;
  total_calls: number;
  last_7_days_calls: number;
  yesterday_calls: number;
  today_calls: number;
};

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return json({ error: 'A bearer access token is required.' }, 401);
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return json({ error: 'Invalid or expired access token.' }, 401);
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, role, is_active')
    .eq('id', user.id)
    .maybeSingle();
  if (profileError) {
    return json({ error: 'Unable to verify admin account.' }, 500);
  }
  if (!profile || profile.role !== 'admin' || !profile.is_active) {
    return json({ error: 'Account is not an active admin.' }, 403);
  }

  const today = istDayRange();
  const yesterday = istDayRange(-1);
  const sevenDaysAgo = istDayRange(-6);
  const { data, error } = await admin.rpc('mobile_correspondent_call_stats', {
    p_seven_days_start: sevenDaysAgo.start,
    p_yesterday_start: yesterday.start,
    p_today_start: today.start,
    p_tomorrow_start: today.end,
  });
  if (error) {
    console.error('mobile correspondentCallStats: query failed', error.code);
    return json({ error: 'Unable to load correspondent call statistics.' }, 500);
  }

  const rows = data as CallStatsRow[] | null;
  const overall = rows?.find((row) => row.correspondent_id === null);
  if (!rows || !overall) {
    return json({ error: 'Correspondent call statistics were unavailable.' }, 500);
  }

  return json({
    timezone: 'Asia/Kolkata',
    periods: {
      last_7_days_start: sevenDaysAgo.start,
      yesterday_start: yesterday.start,
      today_start: today.start,
      tomorrow_start: today.end,
    },
    overall: {
      total_calls: overall.total_calls,
      last_7_days_calls: overall.last_7_days_calls,
      yesterday_calls: overall.yesterday_calls,
      today_calls: overall.today_calls,
    },
    correspondents: rows
      .filter((row) => row.correspondent_id !== null)
      .map((row) => ({
        id: row.correspondent_id,
        full_name: row.full_name,
        is_active: row.is_active,
        total_calls: row.total_calls,
        last_7_days_calls: row.last_7_days_calls,
        yesterday_calls: row.yesterday_calls,
        today_calls: row.today_calls,
      })),
  }, 200);
}
