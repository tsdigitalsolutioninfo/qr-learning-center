import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { requireProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { fmt, istInputToIso } from '@/lib/utils/ist';
import { CALL_STATUSES, INTERESTS, label } from '@/lib/utils/labels';
import type { Row } from '@/lib/types';
import { CalendarDays, CheckCircle2, MapPin, Phone, PhoneCall, PhoneOff, Star, UserRound, XCircle } from 'lucide-react';

const PAGE = 25;
const statusStyle = (status: string) => {
  switch (status) {
    case 'connected': return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'call_back_requested': return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'not_connected':
    case 'busy':
    case 'switched_off': return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'invalid_number':
    case 'disconnected': return 'border-rose-200 bg-rose-50 text-rose-700';
    default: return 'border-neutral-200 bg-neutral-100 text-neutral-600';
  }
};
const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'connected') return <CheckCircle2 size={15} aria-hidden="true" />;
  if (status === 'call_back_requested') return <PhoneCall size={15} aria-hidden="true" />;
  if (status === 'not_connected' || status === 'busy' || status === 'switched_off') return <PhoneOff size={15} aria-hidden="true" />;
  if (status === 'invalid_number' || status === 'disconnected') return <XCircle size={15} aria-hidden="true" />;
  return <Phone size={15} aria-hidden="true" />;
};
export default async function Calls({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await requireProfile();
  const admin = profile.role === 'admin';
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const supabase = await createClient();
  let q = supabase.from('call_logs')
    .select('id, student_id, call_status, interest_status, notes, created_at, students!inner(student_name, phone_number, blocks(name)), profiles!call_logs_called_by_fkey(full_name)', { count: 'exact' })
    .order('created_at', { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);
  const term = (sp.q ?? '').replace(/[,()%*\\]/g, ' ').trim();
  if (term) q = q.or(`student_name.ilike.%${term}%,phone_number.ilike.%${term}%`, { referencedTable: 'students' });
  if (CALL_STATUSES.some(([k]) => k === sp.status)) q = q.eq('call_status', sp.status!);
  if (INTERESTS.some(([k]) => k === sp.interest)) q = q.eq('interest_status', sp.interest!);
  if (sp.by && /^[0-9a-f-]{36}$/i.test(sp.by) && admin) q = q.eq('called_by', sp.by);
  const from = sp.from ? istInputToIso(`${sp.from}T00:00`) : null; const to = sp.to ? istInputToIso(`${sp.to}T23:59`) : null;
  if (from) q = q.gte('created_at', from); if (to) q = q.lte('created_at', to);
  const [{ data, count }, { data: staff }] = await Promise.all([q, admin ? supabase.from('profiles').select('id, full_name').eq('role', 'block_correspondence').order('full_name') : Promise.resolve({ data: [] as Row[] })]);
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));
  const link = (p: number) => { const u = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]); u.set('page', String(p)); return `/calls?${u}`; };
  return (
    <AppShell profile={profile} title={admin ? 'Calls' : 'Call History'}>
      <details className="mb-4 rounded-2xl border border-[#e9e4cf] bg-white p-3 shadow-[0_8px_24px_-20px_rgba(23,25,87,.25)]">
      <summary className="cursor-pointer px-1 py-1 text-sm font-semibold text-[#171957]">Filters</summary>
      <form className="mt-3 grid gap-2 md:grid-cols-4">
        <input name="q" defaultValue={sp.q} placeholder="Student name or phone" className="input" aria-label="Search" />
        <select name="status" defaultValue={sp.status ?? ''} className="input" aria-label="Call status"><option value="">Any call status</option>{CALL_STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <select name="interest" defaultValue={sp.interest ?? ''} className="input" aria-label="Interest"><option value="">Any interest</option>{INTERESTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        {admin && <select name="by" defaultValue={sp.by ?? ''} className="input" aria-label="Correspondent"><option value="">Everyone</option>{(staff as Row[]).map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select>}
        <input name="from" type="date" defaultValue={sp.from} className="input" aria-label="From" /><input name="to" type="date" defaultValue={sp.to} className="input" aria-label="To" />
        <button className="btn">Filter</button>
      </form>
      </details>
      {!data?.length ? <p className="text-sm text-neutral-600">No calls found.</p> : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(data as Row[]).map((c) => {
            const name = String(c.students?.student_name ?? 'Student');
            const initials = name.trim().split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase();
            return <li key={c.id} className="min-w-0 rounded-2xl border border-[#e9e4cf] bg-white p-4 shadow-[0_8px_24px_-20px_rgba(23,25,87,.25)] transition hover:border-[#d8c77e]">
              <div className="flex items-start gap-3">
                <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f2edda] text-sm font-bold text-[#171957] ring-1 ring-[#e8dfbd]">{initials}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <Link href={`/students/${c.student_id}`} className="truncate font-semibold text-[#171957] hover:underline">{name}</Link>
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle(c.call_status)}`}><StatusIcon status={c.call_status} />{label(CALL_STATUSES, c.call_status)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600">
                    <span className="inline-flex items-center gap-1"><MapPin size={13} aria-hidden="true" />{c.students?.blocks?.name || 'Block not set'}</span>
                    <span className="inline-flex items-center gap-1"><UserRound size={13} aria-hidden="true" />{c.profiles?.full_name || 'Unknown correspondent'}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${c.interest_status === 'interested' || c.interest_status === 'registered' ? 'bg-violet-50 text-violet-700' : c.interest_status === 'not_interested' ? 'bg-neutral-100 text-neutral-600' : 'bg-[#fbf5dc] text-[#776117]'}`}><Star size={13} aria-hidden="true" />{label(INTERESTS, c.interest_status)}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-neutral-500"><CalendarDays size={13} aria-hidden="true" />{fmt(c.created_at)}</span>
                  </div>
                  {c.notes && <div className="mt-3 whitespace-pre-wrap rounded-xl bg-[#fbfaf6] px-3 py-2 text-sm leading-5 text-neutral-700"><span className="font-medium text-neutral-800">Notes:</span> {c.notes}</div>}
                </div>
              </div>
            </li>;
          })}
        </ul>)}
      <div className="mt-4 flex items-center justify-between text-sm">
        {page > 1 ? <Link className="btn-outline" href={link(page - 1)}>Previous</Link> : <span />}<span>Page {page} of {pages}</span>
        {page < pages ? <Link className="btn-outline" href={link(page + 1)}>Next</Link> : <span />}
      </div>
    </AppShell>
  );
}
