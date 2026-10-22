import Link from 'next/link';
import { notFound } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import ConfirmButton from '@/components/ui/ConfirmButton';
import { requireProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { fmt } from '@/lib/utils/ist';
import { telHref } from '@/lib/utils/phone';
import { CALL_STATUSES, INTERESTS, label } from '@/lib/utils/labels';
import type { Row } from '@/lib/types';
import { assignStudent, archiveStudent } from '../actions';

export default async function StudentProfile({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const profile = await requireProfile();
  const admin = profile.role === 'admin';
  const { id } = await params; const sp = await searchParams;
  const supabase = await createClient();
  const { data: s } = await supabase.from('students')
    .select('*, districts(name), blocks(name), profiles!students_assigned_to_fkey(full_name)').eq('id', id).maybeSingle();
  if (!s) notFound();
  const [{ data: calls }, { data: fups }, { data: hist }, { data: staff }] = await Promise.all([
    supabase.from('call_logs').select('id, call_status, interest_status, notes, follow_up_at, created_at, profiles!call_logs_called_by_fkey(full_name)').eq('student_id', id).order('created_at', { ascending: false }).limit(50),
    supabase.from('follow_ups').select('id, due_at, status, completed_at').eq('student_id', id).order('due_at', { ascending: false }).limit(20),
    admin ? supabase.from('student_assignments').select('id, assigned_at, unassigned_at, profiles!student_assignments_assigned_to_fkey(full_name)').eq('student_id', id).order('assigned_at', { ascending: false }) : Promise.resolve({ data: [] as Row[] }),
    admin ? supabase.from('profiles').select('id, full_name').eq('role', 'block_correspondence').eq('is_active', true).eq('block_id', s.block_id) : Promise.resolve({ data: [] as Row[] }),
  ]);
  const r = s as Row;
  return (
    <AppShell profile={profile} title={r.student_name}>
      {sp.saved && <p className="mb-3 rounded border border-green-200 bg-green-50 p-2 text-sm text-green-800">Saved.</p>}
      {sp.error && <p role="alert" className="mb-3 text-sm text-red-700">{sp.error}</p>}
      <div className="card mb-4 space-y-1 text-sm">
        <div>{r.phone_number} · {r.districts?.name} / {r.blocks?.name}</div>
        <div>School: {r.school_name ?? '—'} · Class: {r.class_name ?? '—'}</div>
        <div>Interest: <span className="badge">{label(INTERESTS, r.interest_status)}</span> · Assigned: {r.profiles?.full_name ?? 'nobody'}</div>
        <div>Last call: {fmt(r.last_call_at)} ({label(CALL_STATUSES, r.last_call_status)}) · Next follow-up: {fmt(r.next_follow_up_at)}</div>
        {r.notes && <div>Notes: {r.notes}</div>}
        <div className="flex gap-2 pt-2"><a href={telHref(r.phone_number)} className="btn">Call</a>
          {!admin && <Link href={`/students/${id}/call`} className="btn-outline">Record call result</Link>}</div>
      </div>
      {admin && (
        <div className="card mb-4 space-y-3">
          <form action={assignStudent} className="flex gap-2"><input type="hidden" name="id" value={id} />
            <select name="assigned_to" defaultValue={r.assigned_to ?? ''} className="input" aria-label="Assign to">
              <option value="">Unassigned</option>{(staff as Row[]).map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select>
            <button className="btn">Assign</button></form>
          <form action={archiveStudent}><input type="hidden" name="id" value={id} />
            <ConfirmButton message="Archive this student? History is kept but the student leaves active lists.">Archive student</ConfirmButton></form>
        </div>)}
      <h2 className="mb-2 font-medium">Call history</h2>
      {!calls?.length ? <p className="mb-4 text-sm text-neutral-600">No calls recorded.</p> : (
        <ul className="mb-4 divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {(calls as Row[]).map((c) => (<li key={c.id} className="p-3 text-sm"><div className="font-medium">{label(CALL_STATUSES, c.call_status)} · <span className="badge">{label(INTERESTS, c.interest_status)}</span></div>
            <div className="text-neutral-600">{fmt(c.created_at)} · {c.profiles?.full_name}{c.follow_up_at ? ` · follow-up ${fmt(c.follow_up_at)}` : ''}</div>{c.notes && <div>{c.notes}</div>}</li>))}
        </ul>)}
      <h2 className="mb-2 font-medium">Follow-ups</h2>
      {!fups?.length ? <p className="mb-4 text-sm text-neutral-600">None.</p> : (
        <ul className="mb-4 text-sm">{(fups as Row[]).map((f) => <li key={f.id}>{fmt(f.due_at)} · {f.status}{f.completed_at ? ` (${fmt(f.completed_at)})` : ''}</li>)}</ul>)}
      {admin && <><h2 className="mb-2 font-medium">Assignment history</h2>
        {!hist?.length ? <p className="text-sm text-neutral-600">Never assigned.</p> : (
          <ul className="text-sm">{(hist as Row[]).map((h) => <li key={h.id}>{h.profiles?.full_name}: {fmt(h.assigned_at)} → {h.unassigned_at ? fmt(h.unassigned_at) : 'current'}</li>)}</ul>)}</>}
    </AppShell>
  );
}
