import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

const filtersSchema = z.object({
  q: z.string().trim().max(100).optional(),
  interest: z.enum(['unknown', 'interested', 'not_interested', 'maybe_later', 'registered']).optional(),
  contacted: z.enum(['yes', 'no']).optional(),
  district_id: z.string().uuid().optional(),
  block_id: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

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
    .select('id, role, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return json({ error: 'Unable to load account profile.' }, 500);
  }
  if (!profile || !['admin', 'block_correspondence'].includes(profile.role) || !profile.is_active) {
    return json({ error: 'Account is not an active admin or correspondent.' }, 403);
  }

  const parsed = filtersSchema.safeParse({
    q: request.nextUrl.searchParams.get('q') ?? undefined,
    interest: request.nextUrl.searchParams.get('interest') ?? undefined,
    contacted: request.nextUrl.searchParams.get('contacted') ?? undefined,
    district_id: request.nextUrl.searchParams.get('district_id') ?? undefined,
    block_id: request.nextUrl.searchParams.get('block_id') ?? undefined,
    page: request.nextUrl.searchParams.get('page') ?? undefined,
    limit: request.nextUrl.searchParams.get('limit') ?? undefined,
  });
  if (!parsed.success) {
    return json({ error: 'Invalid filters. Check q, interest, contacted, district_id, block_id, page, and limit.' }, 400);
  }

  const { q, interest, contacted, district_id, block_id, page, limit } = parsed.data;
  const from = (page - 1) * limit;
  const adminClient = createAdminClient();
  let studentsQuery = adminClient
    .from('students')
    .select(
      'id, student_name, phone_number, interest_status, last_call_at, last_call_status, next_follow_up_at, school_name, class_name, districts(name), blocks(name), call_logs(count)',
      { count: 'exact' },
    )
    .is('archived_at', null)
    .order('student_name')
    .range(from, from + limit - 1);

  const term = (q ?? '').replace(/[,()%*_\\]/g, ' ').trim();
  if (term) {
    studentsQuery = studentsQuery.or(
      `student_name.ilike.%${term}%,phone_number.ilike.%${term}%,school_name.ilike.%${term}%`,
    );
  }
  if (interest) {
    studentsQuery = studentsQuery.eq('interest_status', interest);
  }
  if (contacted === 'no') {
    studentsQuery = studentsQuery.is('last_call_at', null);
  } else if (contacted === 'yes') {
    studentsQuery = studentsQuery.not('last_call_at', 'is', null);
  }
  if (district_id) {
    studentsQuery = studentsQuery.eq('district_id', district_id);
  }
  if (block_id) {
    studentsQuery = studentsQuery.eq('block_id', block_id);
  }

  const [studentsResult, districtsResult, blocksResult] = await Promise.all([
    studentsQuery,
    adminClient.from('districts').select('id, name').eq('is_active', true).order('name'),
    adminClient.from('blocks').select('id, name, district_id').eq('is_active', true).order('name'),
  ]);
  if (studentsResult.error || districtsResult.error || blocksResult.error) {
    return json({ error: 'Unable to load students and location filters.' }, 500);
  }
  if (!districtsResult.data || !blocksResult.data) {
    return json({ error: 'Student location filters were unavailable.' }, 500);
  }

  const total = studentsResult.count ?? 0;
  return json({
    students: studentsResult.data,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
    filters: {
      districts: districtsResult.data,
      blocks: blocksResult.data,
    },
  }, 200);
}
