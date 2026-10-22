'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
  block_id: z.string().uuid(),
  is_active: z.enum(['true', 'false']),
});
const fail = (m: string): never => redirect('/users/create?error=' + encodeURIComponent(m));

export async function createStaff(formData: FormData) {
  await requireAdmin(); // authenticate + verify active admin
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail('Please check the name, email, block and a temporary password of at least 8 characters.');
  const input = parsed.data;

  // District is derived from the block, so the pair is always consistent.
  const supabase = await createClient();
  const { data: block } = await supabase.from('blocks').select('id, district_id, is_active').eq('id', input.block_id).maybeSingle();
  if (!block || !block.is_active) return fail('Selected block is not available.');

  // Create the auth user with the admin-set temporary password; user must change it at first login.
  const admin = createAdminClient();
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: input.email, password: input.password, email_confirm: true,
    app_metadata: { must_change_password: true },
  });
  if (createErr || !created.user) return fail(createErr?.message.toLowerCase().includes('already') ? 'That email is already registered.' : 'Could not create the account.');

  // Profile with fixed role; roll back the auth user on failure so nothing is orphaned.
  const { error: profileErr } = await admin.from('profiles').insert({
    id: created.user.id, full_name: input.full_name, role: 'block_correspondence',
    district_id: block.district_id, block_id: block.id, is_active: input.is_active === 'true',
  });
  if (profileErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    return fail('Could not create the profile. No account was created.');
  }
  revalidatePath('/users');
  redirect('/users?created=1');
}

export async function toggleUser(formData: FormData) {
  const me = await requireAdmin();
  const id = z.string().uuid().parse(formData.get('id'));
  if (id === me.id) return; // admins cannot deactivate themselves
  const supabase = await createClient();
  await supabase.from('profiles').update({ is_active: formData.get('active') !== 'true' }).eq('id', id).eq('role', 'block_correspondence').throwOnError();
  revalidatePath('/users');
}
