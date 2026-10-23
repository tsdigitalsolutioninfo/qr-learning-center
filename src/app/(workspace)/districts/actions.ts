'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export async function addDistrict(formData: FormData) {
  await requireAdmin();
  const parsed = z.string().trim().min(2).max(100).safeParse(formData.get('name'));
  if (!parsed.success) redirect('/districts?error=' + encodeURIComponent('Enter a district name (2-100 characters).'));
  const supabase = await createClient();
  const { error } = await supabase.from('districts').insert({ name: parsed.data });
  if (error) redirect('/districts?error=' + encodeURIComponent(error.code === '23505' ? 'That district already exists.' : 'Could not add district.'));
  revalidatePath('/districts'); redirect('/districts');
}
export async function toggleDistrict(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(formData.get('id'));
  const supabase = await createClient();
  await supabase.from('districts').update({ is_active: formData.get('active') !== 'true' }).eq('id', id);
  revalidatePath('/districts');
}

export async function editDistrict(formData: FormData) {
  await requireAdmin();
  const parsed = z.object({
    id: z.string().uuid(),
    name: z.string().trim().min(2).max(100),
  }).safeParse({ id: formData.get('id'), name: formData.get('name') });
  if (!parsed.success) redirect('/districts?error=' + encodeURIComponent('Enter a district name (2-100 characters).'));
  const supabase = await createClient();
  const { error } = await supabase.from('districts').update({ name: parsed.data.name }).eq('id', parsed.data.id);
  if (error) redirect('/districts?error=' + encodeURIComponent(error.code === '23505' ? 'That district already exists.' : 'Could not update district.'));
  revalidatePath('/districts');
  redirect('/districts');
}
