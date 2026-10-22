import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { requireProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { fmt } from '@/lib/utils/ist';
import { telHref } from '@/lib/utils/phone';
import { CALL_STATUSES, INTERESTS, label } from '@/lib/utils/labels';
import type { Row } from '@/lib/types';

const PAGE = 25;
const UUID = /^[0-9a-f-]{36}$/i;
const callStatusStyle = (status: string | null) => {
  switch (status) {
    case 'connected': return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'not_connected':
    case 'busy':
    case 'switched_off': return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'invalid_number':
    case 'disconnected': return 'border-red-200 bg-red-50 text-red-700';
    case 'call_back_requested': return 'border-blue-200 bg-blue-50 text-blue-700';
    default: return 'border-neutral-200 bg-neutral-100 text-neutral-600';
  }
};

export default async function Students({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await requireProfile();
  const admin = profile.role === 'admin';
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const supabase = await createClient();
  let q = supabase.from('students')
    .select('id, student_name, phone_number, interest_status, last_call_at, last_call_status, next_follow_up_at, school_name, class_name, blocks(name), call_logs(count)', { count: 'exact' })
    .is('archived_at', null).order('student_name').range((page - 1) * PAGE, page * PAGE - 1);
  const term = (sp.q ?? '').replace(/[,()%*\\]/g, ' ').trim();
  if (term) q = q.or(`student_name.ilike.%${term}%,phone_number.ilike.%${term}%,school_name.ilike.%${term}%`);
  if (sp.interest && INTERESTS.some(([k]) => k === sp.interest)) q = q.eq('interest_status', sp.interest);
  if (admin && sp.block && UUID.test(sp.block)) q = q.eq('block_id', sp.block);
  if (sp.contacted === 'no') q = q.is('last_call_at', null);
  const [{ data, count }, { data: blocks }] = await Promise.all([q, admin ? supabase.from('blocks').select('id, name').order('name') : Promise.resolve({ data: [] as Row[] })]);
  const rows = (data ?? []) as Row[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));
  const link = (p: number) => { const u = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]); u.set('page', String(p)); return `/students?${u}`; };
  return (
    <AppShell profile={profile} title={admin ? 'Students' : 'Block Students'}>
      <form className="mb-4 grid gap-2 md:grid-cols-6">
        <input name="q" defaultValue={sp.q} placeholder="Search name, phone, school" className="input md:col-span-2" aria-label="Search" />
        <select name="interest" defaultValue={sp.interest ?? ''} className="input" aria-label="Interest"><option value="">Any interest</option>
          {INTERESTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        {admin ? <select name="block" defaultValue={sp.block ?? ''} className="input" aria-label="Block"><option value="">All blocks</option>
          {(blocks as Row[]).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
          : <select name="contacted" defaultValue={sp.contacted ?? ''} className="input" aria-label="Contacted"><option value="">All</option><option value="no">Not yet contacted</option></select>}
        <button className="btn px-2 md:w-full">Filter</button>
      </form>
      {!rows.length ? <p className="text-sm text-neutral-600">No students found.</p> : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {rows.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
              <div className="w-full min-w-0 flex-1 sm:w-auto"><Link href={`/students/${s.id}`} className="break-words font-medium underline">{s.student_name}</Link>
                <div className="text-sm text-neutral-600">{s.phone_number} · {s.blocks?.name}{s.school_name ? ` · ${s.school_name}` : ''}{s.class_name ? ` (${s.class_name})` : ''}</div>
                <div className="text-xs text-neutral-500"><span className="badge">{label(INTERESTS, s.interest_status)}</span>{' '}
                  Last call: {fmt(s.last_call_at)} · Next follow-up: {fmt(s.next_follow_up_at)}</div></div>
              {admin && <div className="flex w-full shrink-0 flex-col items-start gap-1 sm:ml-auto sm:w-auto sm:items-end">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${callStatusStyle(s.last_call_status)}`}>
                  {s.last_call_status ? label(CALL_STATUSES, s.last_call_status) : 'Pending'}
                </span>
                <span className="text-xs text-neutral-500">{s.call_logs?.[0]?.count ?? 0} call attempts</span>
              </div>}
              {!admin && <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
                <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${callStatusStyle(s.last_call_status)}`}>
                  {s.last_call_status ? label(CALL_STATUSES, s.last_call_status) : 'Pending'}
                </span>
                <a href={telHref(s.phone_number)} className="btn">Call</a>
                <Link href={`/students/${s.id}/call`} className="btn-outline">Call status</Link></div>}
            </li>))}
        </ul>)}
      <div className="mt-4 flex items-center justify-between text-sm">
        {page > 1 ? <Link className="btn-outline" href={link(page - 1)}>Previous</Link> : <span />}
        <span>Page {page} of {pages} · {count ?? 0} students</span>
        {page < pages ? <Link className="btn-outline" href={link(page + 1)}>Next</Link> : <span />}
      </div>
    </AppShell>
  );
}
