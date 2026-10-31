import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { requireProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { fmt } from '@/lib/utils/ist';
import { telHref } from '@/lib/utils/phone';
import { CALL_STATUSES, INTERESTS, label } from '@/lib/utils/labels';
import type { Row } from '@/lib/types';
import StudentLocationFilters from '@/components/students/StudentLocationFilters';
import { GraduationCap, MapPin, Phone } from 'lucide-react';

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
  const district = admin && sp.district && UUID.test(sp.district) ? sp.district : '';
  const block = district && sp.block && UUID.test(sp.block) ? sp.block : '';
  if (district) q = q.eq('district_id', district);
  if (block) q = q.eq('block_id', block);
  if (sp.contacted === 'no') q = q.is('last_call_at', null);
  const [{ data, count }, { data: districts }] = await Promise.all([
    q,
    admin ? supabase.from('districts').select('id, name, blocks(id, name)').order('name') : Promise.resolve({ data: null }),
  ]);
  const districtOptions = (districts ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    blocks: d.blocks ?? [],
  }));
  const selectedDistrict = districtOptions.find((d) => d.id === district)?.id ?? '';
  const selectedBlock = districtOptions.find((d) => d.id === selectedDistrict)?.blocks.some((b) => b.id === block)
    ? block
    : '';
  const rows = (data ?? []) as Row[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));
  const link = (p: number) => { const u = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]); u.set('page', String(p)); return `/students?${u}`; };
  return (
    <AppShell profile={profile} title={admin ? 'Students' : 'Block Students'}>
      <details className="mb-4 rounded-2xl border border-[#e9e4cf] bg-white p-3 shadow-[0_8px_24px_-20px_rgba(23,25,87,.25)]">
      <summary className="cursor-pointer px-1 py-1 text-sm font-semibold text-[#171957]">Filters</summary>
      <form className="mt-3 grid gap-2 md:grid-cols-6">
        <input name="q" defaultValue={sp.q} placeholder="Search name, phone, school" className="input md:col-span-2" aria-label="Search" />
        <select name="interest" defaultValue={sp.interest ?? ''} className="input" aria-label="Interest"><option value="">Any interest</option>
          {INTERESTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        {admin ? <StudentLocationFilters districts={districtOptions} selectedDistrict={selectedDistrict} selectedBlock={selectedBlock} />
          : <select name="contacted" defaultValue={sp.contacted ?? ''} className="input" aria-label="Contacted"><option value="">All</option><option value="no">Not yet contacted</option></select>}
        <button className="btn px-2 md:w-full">Filter</button>
      </form>
      </details>
      {!rows.length ? <p className="text-sm text-neutral-600">No students found.</p> : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 p-4 sm:p-2">
          {rows.map((s) => (
            <li key={s.id} className="min-w-0 rounded-2xl border border-[#e9e4cf] bg-white shadow-[0_8px_24px_-20px_rgba(23,25,87,.25)] transition hover:border-[#d8c77e] hover:bg-[#fffefa]">
              <Link href={`/students/${s.id}`} aria-label={`Open ${s.student_name}'s profile`} className="flex min-w-0 items-center gap-3 rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b99b37] sm:p-4">
              <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f2edda] text-sm font-bold text-[#171957] ring-1 ring-[#e8dfbd]">
                {String(s.student_name ?? '?').trim().split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-start justify-start gap-1.5">
                  <h2 className="min-w-0 truncate font-semibold text-[#171957]">{s.student_name}</h2>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#e8dfbd] bg-[#f8f5e9] px-2 py-0.5 text-[11px] font-semibold text-[#6c5818]">
                    <GraduationCap size={13} aria-hidden="true" />
                    {s.class_name || 'Class not set'}
                  </span>
                </div>
                <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600">
                  <span className="inline-flex items-center gap-1"><MapPin size={13} aria-hidden="true" />{s.blocks?.name || 'Block not set'}</span>
                  <span title={`Last call: ${s.last_call_status ? label(CALL_STATUSES, s.last_call_status) : 'Pending'}`} className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${callStatusStyle(s.last_call_status)}`}>
                    <Phone size={12} aria-hidden="true" />
                    {s.last_call_status ? label(CALL_STATUSES, s.last_call_status) : 'Pending'}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-neutral-500">{s.phone_number || 'Phone number not provided'}</p>
              </div>
              </Link>
            </li>))}
        </ul>)}      <div className="mt-4 flex items-center justify-between text-sm">
        {page > 1 ? <Link className="btn-outline" href={link(page - 1)}>Previous</Link> : <span />}
        <span>Page {page} of {pages} · {count ?? 0} students</span>
        {page < pages ? <Link className="btn-outline" href={link(page + 1)}>Next</Link> : <span />}
      </div>
    </AppShell>
  );
}
