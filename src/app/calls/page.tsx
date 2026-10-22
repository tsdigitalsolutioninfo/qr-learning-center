import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { requireProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { fmt, istInputToIso } from '@/lib/utils/ist';
import { CALL_STATUSES, INTERESTS, label } from '@/lib/utils/labels';
import type { Row } from '@/lib/types';

const PAGE = 25;
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
      <form className="mb-4 grid gap-2 md:grid-cols-4">
        <input name="q" defaultValue={sp.q} placeholder="Student name or phone" className="input" aria-label="Search" />
        <select name="status" defaultValue={sp.status ?? ''} className="input" aria-label="Call status"><option value="">Any call status</option>{CALL_STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <select name="interest" defaultValue={sp.interest ?? ''} className="input" aria-label="Interest"><option value="">Any interest</option>{INTERESTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        {admin && <select name="by" defaultValue={sp.by ?? ''} className="input" aria-label="Correspondent"><option value="">Everyone</option>{(staff as Row[]).map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select>}
        <input name="from" type="date" defaultValue={sp.from} className="input" aria-label="From" /><input name="to" type="date" defaultValue={sp.to} className="input" aria-label="To" />
        <button className="btn">Filter</button>
      </form>
      {!data?.length ? <p className="text-sm text-neutral-600">No calls found.</p> : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {(data as Row[]).map((c) => (<li key={c.id} className="p-3 text-sm"><Link href={`/students/${c.student_id}`} className="font-medium underline">{c.students?.student_name}</Link>{' '}
            <span className="text-neutral-600">{c.students?.blocks?.name} · {c.profiles?.full_name}</span>
            <div>{label(CALL_STATUSES, c.call_status)} · <span className="badge">{label(INTERESTS, c.interest_status)}</span> · {fmt(c.created_at)}</div>{c.notes && <div className="text-neutral-700">{c.notes}</div>}</li>))}
        </ul>)}
      <div className="mt-4 flex items-center justify-between text-sm">
        {page > 1 ? <Link className="btn-outline" href={link(page - 1)}>Previous</Link> : <span />}<span>Page {page} of {pages}</span>
        {page < pages ? <Link className="btn-outline" href={link(page + 1)}>Next</Link> : <span />}
      </div>
    </AppShell>
  );
}
