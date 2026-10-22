'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({ district_id: z.string().uuid(), name: z.string().trim().min(2).max(100) });

export async function addBlock(formData: FormData) {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect('/blocks?error=' + encodeURIComponent('Choose a district and enter a block name.'));
  const supabase = await createClient();
  const { error } = await supabase.from('blocks').insert(parsed.data!);
  if (error) redirect('/blocks?error=' + encodeURIComponent(error.code === '23505' ? 'That block already exists in this district.' : 'Could not add block.'));
  revalidatePath('/blocks'); redirect('/blocks');
}
export async function toggleBlock(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(formData.get('id'));
  const supabase = await createClient();
  await supabase.from('blocks').update({ is_active: formData.get('active') !== 'true' }).eq('id', id);
  revalidatePath('/blocks');
}
