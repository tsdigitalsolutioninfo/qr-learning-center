'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin, requireProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { normalizePhone } from '@/lib/utils/phone';
import { istInputToIso } from '@/lib/utils/ist';
import { callValues, interestValues, fail } from '@/lib/utils/labels';

const opt = z.string().trim().max(200).optional().transform((v) => v || null);
const studentSchema = z.object({
  student_name: z.string().trim().min(2).max(120), phone_number: z.string().trim(),
  district_id: z.string().uuid(), block_id: z.string().uuid(),
  school_name: opt, class_name: opt, interest_status: z.enum(interestValues),
  notes: z.string().trim().max(2000).optional().transform((v) => v || null),
});

export async function addStudent(formData: FormData) {
  const me = await requireAdmin();
  const parsed = studentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail('/students/new', 'Please check the required fields.');
  const phone = normalizePhone(parsed.data.phone_number);
  if (!phone) return fail('/students/new', 'Enter a valid Indian mobile number.');
  const supabase = await createClient();
  const { data, error } = await supabase.from('students').insert({ ...parsed.data, phone_number: phone, created_by: me.id }).select('id').single();
  if (error) { console.error('addStudent', error.code); return fail('/students/new', error.code === '23503' ? 'Block does not belong to that district.' : 'Could not save the student.'); }
  redirect(`/students/${data.id}?saved=1`);
}

export async function assignStudent(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(formData.get('id'));
  const to = z.string().uuid().or(z.literal('')).parse(formData.get('assigned_to'));
  const supabase = await createClient();
  // DB trigger validates role/active/block, writes assignment history and moves pending follow-ups.
  const { error } = await supabase.from('students').update({ assigned_to: to || null }).eq('id', id);
  if (error) { console.error('assign', error.code); return fail(`/students/${id}`, 'Assignment rejected: the user must be an active correspondent of the same block.'); }
  revalidatePath(`/students/${id}`); redirect(`/students/${id}?saved=1`);
}

export async function archiveStudent(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(formData.get('id'));
  const supabase = await createClient();
  const { error } = await supabase.from('students').update({ archived_at: new Date().toISOString() }).eq('id', id);
  if (error) return fail(`/students/${id}`, 'Could not archive the student.');
  redirect('/students');
}

const callSchema = z.object({
  student_id: z.string().uuid(), request_id: z.string().uuid(), call_status: z.enum(callValues), interest_status: z.enum(interestValues),
  notes: z.string().trim().max(2000).optional().transform((v) => v || null), follow_up_at: z.string().optional(),
});
export async function recordCall(formData: FormData) {
  const me = await requireProfile();
  const back = `/students/${String(formData.get('student_id'))}/call`;
  const parsed = callSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(back, 'Please check the call details.');
  const d = parsed.data;
  const required = formData.get('follow_up_required') === 'on';
  let followUp: string | null = null;
  if (required) {
    followUp = d.follow_up_at ? istInputToIso(d.follow_up_at) : null;
    if (!followUp || new Date(followUp) <= new Date()) return fail(back, 'Choose a follow-up date and time in the future.');
  }
  const supabase = await createClient();
  const { error } = await supabase.from('call_logs').insert({
    student_id: d.student_id, called_by: me.id, call_status: d.call_status, interest_status: d.interest_status, notes: d.notes,
    follow_up_required: required, follow_up_at: followUp, request_id: d.request_id, call_started_at: null,
  });
  // 23505 = same request_id already saved (double submit): treat as success without duplicating.
  if (error && error.code !== '23505') {
    console.error('recordCall', error.code);
    return fail(back, error.code === '42501' ? 'This student is not assigned to you.' : 'Could not save the call. Nothing was recorded.');
  }
  revalidatePath('/dashboard');
  redirect(`/students/${d.student_id}?saved=1`);
}
