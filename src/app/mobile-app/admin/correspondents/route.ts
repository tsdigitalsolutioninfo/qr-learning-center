import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

const json = (body: object, status: number) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

type AdminAuthorization = { authorized: true } | { response: NextResponse };

async function authorizeAdmin(request: NextRequest): Promise<AdminAuthorization> {
  const authorization = request.headers.get('authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return { response: json({ error: 'A bearer access token is required.' }, 401) };
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { response: json({ error: 'Invalid or expired access token.' }, 401) };
  }

  const { data: profile, error: profileError } = await createAdminClient()
    .from('profiles')
    .select('id, role, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return { response: json({ error: 'Unable to verify admin account.' }, 500) };
  }
  if (!profile || profile.role !== 'admin' || !profile.is_active) {
    return { response: json({ error: 'Account is not an active admin.' }, 403) };
  }

  return { authorized: true };
}

const correspondentFields =
  'id, full_name, is_active, district_id, block_id, created_at, blocks(name, districts(name))';

export async function GET(request: NextRequest) {
  const authorization = await authorizeAdmin(request);
  if ('response' in authorization) return authorization.response;

  const admin = createAdminClient();
  const correspondents = [];
  const pageSize = 500;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await admin
      .from('profiles')
      .select(correspondentFields)
      .eq('role', 'block_correspondence')
      .order('full_name')
      .order('id')
      .range(from, from + pageSize - 1);
    if (error) {
      return json({ error: 'Unable to load correspondent accounts.' }, 500);
    }

    const page = data ?? [];
    correspondents.push(...page);
    if (page.length < pageSize) break;
  }

  return json({ correspondents }, 200);
}

const updateSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().min(2).max(100).optional(),
  block_id: z.string().uuid().optional(),
  is_active: z.boolean().optional(),
}).refine(
  ({ full_name, block_id, is_active }) =>
    full_name !== undefined || block_id !== undefined || is_active !== undefined,
);

export async function PATCH(request: NextRequest) {
  const authorization = await authorizeAdmin(request);
  if ('response' in authorization) return authorization.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Provide a correspondent id and at least one valid field to update.' }, 400);
  }

  const admin = createAdminClient();
  const { id, ...fields } = parsed.data;
  const updates: {
    full_name?: string;
    block_id?: string;
    district_id?: string;
    is_active?: boolean;
  } = {};
  if (fields.full_name !== undefined) updates.full_name = fields.full_name;
  if (fields.is_active !== undefined) updates.is_active = fields.is_active;
  if (fields.block_id !== undefined) {
    const { data: block, error: blockError } = await admin
      .from('blocks')
      .select('id, district_id')
      .eq('id', fields.block_id)
      .eq('is_active', true)
      .maybeSingle();
    if (blockError) {
      return json({ error: 'Unable to verify the selected block.' }, 500);
    }
    if (!block) {
      return json({ error: 'Selected block is not available.' }, 400);
    }
    updates.block_id = block.id;
    updates.district_id = block.district_id;
  }

  const { data: correspondent, error } = await admin
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .eq('role', 'block_correspondence')
    .select(correspondentFields)
    .maybeSingle();
  if (error) {
    return json({ error: 'Could not update correspondent account.' }, 500);
  }
  if (!correspondent) {
    return json({ error: 'Correspondent account was not found.' }, 404);
  }

  return json({ correspondent }, 200);
}

export async function DELETE(request: NextRequest) {
  const authorization = await authorizeAdmin(request);
  if ('response' in authorization) return authorization.response;

  const parsed = z.string().uuid().safeParse(request.nextUrl.searchParams.get('id'));
  if (!parsed.success) {
    return json({ error: 'A valid correspondent id is required.' }, 400);
  }

  const admin = createAdminClient();
  const { data: correspondent, error: lookupError } = await admin
    .from('profiles')
    .select('id, full_name, district_id, block_id, is_active')
    .eq('id', parsed.data)
    .eq('role', 'block_correspondence')
    .maybeSingle();
  if (lookupError) {
    return json({ error: 'Unable to load correspondent account.' }, 500);
  }
  if (!correspondent) {
    return json({ error: 'Correspondent account was not found.' }, 404);
  }

  const { data: deletedProfile, error: deleteProfileError } = await admin
    .from('profiles')
    .delete()
    .eq('id', correspondent.id)
    .eq('role', 'block_correspondence')
    .select('id')
    .maybeSingle();
  if (deleteProfileError?.code === '23503') {
    return json({
      error: 'Cannot permanently delete a correspondent with linked records. Deactivate the account instead.',
    }, 409);
  }
  if (deleteProfileError) {
    return json({ error: 'Could not remove correspondent profile.' }, 500);
  }
  if (!deletedProfile) {
    return json({ error: 'Correspondent account was not found.' }, 404);
  }

  const { error: deleteUserError } = await admin.auth.admin.deleteUser(correspondent.id);
  if (deleteUserError) {
    const { error: restoreError } = await admin.from('profiles').insert({
      id: correspondent.id,
      full_name: correspondent.full_name,
      role: 'block_correspondence',
      district_id: correspondent.district_id,
      block_id: correspondent.block_id,
      is_active: correspondent.is_active,
    });
    if (restoreError) {
      console.error('mobile manageCorrespondent: profile restore failed', restoreError.code);
      return json({
        error: 'Account deletion failed and the correspondent profile could not be restored. Contact support.',
      }, 500);
    }
    return json({ error: 'Could not delete the authentication account; the profile was restored.' }, 500);
  }

  return json({ deleted: true, id: correspondent.id }, 200);
}
