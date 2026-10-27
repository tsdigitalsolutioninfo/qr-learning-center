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
import { archiveStudent } from '../actions';

export default async function StudentProfile({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const profile = await requireProfile();
  const admin = profile.role === 'admin';
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: s } = await supabase.from('students')
    .select('*, districts(name), blocks(name)').eq('id', id).maybeSingle();
  if (!s) notFound();
  const [{ data: calls }, { data: fups }] = await Promise.all([
    supabase.from('call_logs').select('id, call_status, interest_status, notes, follow_up_at, created_at, profiles!call_logs_called_by_fkey(full_name)').eq('student_id', id).order('created_at', { ascending: false }).limit(50),
    supabase.from('follow_ups').select('id, due_at, status, completed_at').eq('student_id', id).order('due_at', { ascending: false }).limit(20),
  ]);
  const r = s as Row;
  const initials = String(r.student_name ?? '?').trim().split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase();
  return (
    <AppShell profile={profile} title={r.student_name}>
      {sp.saved && <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">Changes saved successfully.</p>}
      {sp.error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{sp.error}</p>}

      <section className="!mt-0 overflow-hidden rounded-2xl border border-[#e9e4cf] bg-white shadow-[0_12px_32px_-24px_rgba(23,25,87,.35)]">
        <div className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-7 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f7f1d9] text-lg font-semibold text-[#776117]">{initials}</div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight text-[#171957]">{r.student_name}</h2>
              {r.phone_number ? <a href={telHref(r.phone_number)} className="mt-1 inline-flex text-base font-medium text-[#34366e] hover:underline">{r.phone_number}</a> : <p className="mt-1 text-sm text-neutral-500">Phone number not provided</p>}
              <p className="mt-1 text-sm text-neutral-500">{[r.districts?.name, r.blocks?.name].filter(Boolean).join(' · ') || 'Location not provided'}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="badge">{label(INTERESTS, r.interest_status)}</span>
                {r.class_name && <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-600">Class {r.class_name}</span>}
              </div>
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto lg:justify-end">
            {r.phone_number && <a href={telHref(r.phone_number)} className="btn">Call student</a>}
            {!admin && <Link href={`/students/${id}/call`} className="btn-outline">Record call result</Link>}
          </div>
        </div>
        <div className="grid gap-3 border-t border-[#eeeadd] bg-[#fdfcf8] px-4 py-4 sm:grid-cols-2 sm:gap-4 sm:px-7 sm:py-5 lg:grid-cols-3">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">School</p><p className="mt-1 text-sm font-medium text-[#26274e]">{r.school_name || 'Not provided'}</p></div>
          <div><p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Last call</p><p className="mt-1 text-sm font-medium text-[#26274e]">{fmt(r.last_call_at)}</p><p className="mt-0.5 text-xs text-neutral-500">{label(CALL_STATUSES, r.last_call_status)}</p></div>
          <div><p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Next follow-up</p><p className="mt-1 text-sm font-medium text-[#26274e]">{fmt(r.next_follow_up_at)}</p></div>
          {r.notes && <div className="sm:col-span-2 lg:col-span-3"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Notes</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#37374b]">{r.notes}</p></div>}
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="!mt-0 overflow-hidden rounded-2xl border border-[#e9e4cf] bg-white shadow-[0_8px_24px_-20px_rgba(23,25,87,.25)]">
          <div className="flex items-center justify-between gap-2 border-b border-[#eeeadd] px-4 py-3.5 sm:px-5 sm:py-4"><div className="min-w-0"><h2 className="!mb-0 text-base font-semibold text-[#171957]">Call history</h2><p className="mt-1 text-xs text-neutral-500">Recent conversations and outcomes</p></div><span className="shrink-0 rounded-full bg-[#f4f2ea] px-2.5 py-1 text-xs font-medium text-neutral-600">{calls?.length ?? 0}</span></div>
          {!calls?.length ? <p className="px-5 py-8 text-center text-sm text-neutral-500">No calls have been recorded yet.</p> : <ul className="divide-y divide-[#f0eee7]">
            {(calls as Row[]).map((c) => <li key={c.id} className="px-5 py-4"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-[#26274e]">{label(CALL_STATUSES, c.call_status)}</span><span className="badge">{label(INTERESTS, c.interest_status)}</span></div><p className="mt-1.5 text-xs text-neutral-500">{fmt(c.created_at)}{c.profiles?.full_name ? ` · ${c.profiles.full_name}` : ''}</p>{c.follow_up_at && <p className="mt-1 text-xs text-[#66520d]">Follow-up: {fmt(c.follow_up_at)}</p>}{c.notes && <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-neutral-700">{c.notes}</p>}</li>)}
          </ul>}
        </section>

        <section className="!mt-0 overflow-hidden rounded-2xl border border-[#e9e4cf] bg-white shadow-[0_8px_24px_-20px_rgba(23,25,87,.25)]">
          <div className="flex items-center justify-between gap-2 border-b border-[#eeeadd] px-4 py-3.5 sm:px-5 sm:py-4"><div className="min-w-0"><h2 className="!mb-0 text-base font-semibold text-[#171957]">Follow-ups</h2><p className="mt-1 text-xs text-neutral-500">Scheduled check-ins</p></div><span className="shrink-0 rounded-full bg-[#f4f2ea] px-2.5 py-1 text-xs font-medium text-neutral-600">{fups?.length ?? 0}</span></div>
          {!fups?.length ? <p className="px-5 py-8 text-center text-sm text-neutral-500">No follow-ups scheduled.</p> : <ul className="divide-y divide-[#f0eee7]">{(fups as Row[]).map((f) => <li key={f.id} className="flex flex-col items-start justify-between gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-3 sm:px-5 sm:py-4"><div><p className="text-sm font-medium text-[#26274e]">{fmt(f.due_at)}</p>{f.completed_at && <p className="mt-1 text-xs text-neutral-500">Completed {fmt(f.completed_at)}</p>}</div><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${f.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#fbf5dc] text-[#66520d]'}`}>{String(f.status).replaceAll('_', ' ')}</span></li>)}</ul>}
        </section>
      </div>

      {admin && <div className="mt-5 flex justify-end rounded-2xl border border-[#e9e4cf] bg-white p-3 sm:p-4"><form action={archiveStudent} className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4"><input type="hidden" name="id" value={id} /><span className="hidden text-xs text-neutral-500 sm:inline">Remove this student from active lists</span><ConfirmButton message="Archive this student? History is kept but the student leaves active lists.">Archive student</ConfirmButton></form></div>}
    </AppShell>
  );
}
