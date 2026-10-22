'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { istInputToIso } from '@/lib/utils/ist';

// RLS limits updates to the assignee (or an admin); .select() confirms a row was really changed.
async function change(formData: FormData, patch: Record<string, unknown>, view: string) {
  await requireProfile();
  const id = z.string().uuid().parse(formData.get('id'));
  const supabase = await createClient();
  const { data, error } = await supabase.from('follow_ups').update(patch).eq('id', id).eq('status', 'pending').select('id');
  if (error || !data?.length) redirect(`/follow-ups?view=${view}&error=${encodeURIComponent('Could not update this follow-up.')}`);
  revalidatePath('/follow-ups'); redirect(`/follow-ups?view=${view}&saved=1`);
}
export async function completeFollowUp(f: FormData) { await change(f, { status: 'completed' }, 'today'); }
export async function cancelFollowUp(f: FormData) { await change(f, { status: 'cancelled' }, 'today'); }
export async function rescheduleFollowUp(f: FormData) {
  const iso = istInputToIso(String(f.get('due_at') ?? ''));
  if (!iso || new Date(iso) <= new Date()) redirect('/follow-ups?error=' + encodeURIComponent('Choose a valid future date and time.'));
  await change(f, { due_at: iso }, 'upcoming');
}
