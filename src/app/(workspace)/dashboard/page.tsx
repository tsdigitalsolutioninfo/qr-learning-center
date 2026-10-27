import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { requireProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { istDayRange, fmt } from '@/lib/utils/ist';
import { telHref } from '@/lib/utils/phone';
import { CALL_STATUSES, INTERESTS, label } from '@/lib/utils/labels';
import type { Row } from '@/lib/types';
import { AlertCircle, CalendarClock, CheckCheck, GraduationCap, Headphones, MapPin, Phone, RotateCcw, Star, Users, XCircle } from 'lucide-react';

const n = async (p: PromiseLike<{ count: number | null }>) => (await p).count ?? 0;

export default async function Dashboard() {
  const profile = await requireProfile();
  const admin = profile.role === 'admin';
  const supabase = await createClient();
  const { start, end } = istDayRange();
  const st = () => supabase.from('students').select('*', { count: 'exact', head: true }).is('archived_at', null);
  const cl = () => supabase.from('call_logs').select('*', { count: 'exact', head: true }).gte('created_at', start).lt('created_at', end);
  const fu = () => supabase.from('follow_ups').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  // RLS scopes every count: admins see everything, correspondents only their block.
  const [total, uncontacted, interested, notInt, calls, connected, dueToday, overdue] = await Promise.all([
    n(st()), n(st().is('last_call_at', null)),
    n(st().eq('interest_status', 'interested')), n(st().eq('interest_status', 'not_interested')),
    n(cl()), n(cl().eq('call_status', 'connected')),
    n(fu().gte('due_at', start).lt('due_at', end)), n(fu().lt('due_at', start)),
  ]);
  const stats: [string, number][] = admin
    ? [['Total students', total], ['Not yet contacted', uncontacted], ['Calls today', calls], ['Connected today', connected],
       ['Interested', interested], ['Not interested', notInt], ['Follow-ups due today', dueToday], ['Overdue follow-ups', overdue]]
    : [['Students in my block', total], ['Not yet contacted', uncontacted], ['Calls today', calls], ['Connected today', connected],
       ['Interested', interested], ['Follow-ups due today', dueToday], ['Overdue follow-ups', overdue]];
  const statIcons: Record<string, typeof Users> = {
    'Total students': Users,
    'Students in my block': GraduationCap,
    'Not yet contacted': Phone,
    'Calls today': Headphones,
    'Connected today': CheckCheck,
    Interested: Star,
    'Not interested': XCircle,
    'Follow-ups due today': CalendarClock,
    'Overdue follow-ups': AlertCircle,
  };

  const { data: recent } = await supabase.from('call_logs')
    .select('id, student_id, call_status, interest_status, created_at, students(student_name, blocks(name)), profiles!call_logs_called_by_fkey(full_name)')
    .order('created_at', { ascending: false }).limit(10);

  // Action list (correspondents): overdue/today follow-ups > callback requested > uncontacted; one entry per student.
  let actions: { id: string; name: string; why: string; phone: string | null; className: string | null; blockName: string | null; callStatus: string | null }[] = [];
  if (!admin) {
    const [{ data: f }, { data: cb }, { data: nc }] = await Promise.all([
      supabase.from('follow_ups').select('student_id, due_at, students(student_name, phone_number, class_name, last_call_status, blocks(name))').eq('status', 'pending').lt('due_at', end).order('due_at').limit(20),
      supabase.from('students').select('id, student_name, phone_number, class_name, last_call_status, blocks(name)').is('archived_at', null).eq('last_call_status', 'call_back_requested').limit(10),
      supabase.from('students').select('id, student_name, phone_number, class_name, last_call_status, blocks(name)').is('archived_at', null).is('last_call_at', null).limit(10),
    ]);
    const seen = new Set<string>();
    const add = (id: string, student: Row, why: string) => { if (!seen.has(id)) { seen.add(id); actions.push({ id, name: student?.student_name ?? 'Student', why, phone: student?.phone_number ?? null, className: student?.class_name ?? null, blockName: student?.blocks?.name ?? null, callStatus: student?.last_call_status ?? null }); } };
    (f as Row[] | null)?.forEach((x) => add(x.student_id, x.students, x.due_at < start ? 'Overdue follow-up' : 'Follow-up due today'));
    (cb as Row[] | null)?.forEach((x) => add(x.id, x, 'Asked for a call back'));
    (nc as Row[] | null)?.forEach((x) => add(x.id, x, 'Not yet contacted'));
    actions = actions.slice(0, 15);
  }
  const rows = (recent ?? []) as Row[];
  return (
    <AppShell profile={profile} title={admin ? 'Dashboard' : 'My Dashboard'}>
      <div className="pb-8 sm:pb-0">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map(([l, v]) => {
          const Icon = statIcons[l] ?? RotateCcw;
          const urgent = l === 'Overdue follow-ups';
          return <div key={l} className="card flex min-h-28 flex-col justify-between gap-3 transition-shadow hover:shadow-[0_12px_30px_-18px_rgba(23,25,87,.3)] sm:min-h-32 sm:gap-4">
            <div className="flex items-start justify-between gap-2"><div className="text-2xl font-semibold tracking-tight text-[#171957] sm:text-3xl">{v}</div><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${urgent ? 'bg-rose-50 text-rose-700' : 'bg-[#fbf5dc] text-[#776117]'}`}><Icon aria-hidden="true" size={18} strokeWidth={1.8} /></span></div>
            <div className="text-sm font-medium leading-5 text-neutral-600">{l}</div>
          </div>;
        })}
      </div>
      {!admin && (
        <section className="mt-6"><h2 className="mb-2 font-medium">Needs action</h2>
          {!actions.length ? <p className="text-sm text-neutral-600">Nothing needs action right now.</p> : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {actions.map((a) => (
                <li key={a.id} className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#e9e4cf] bg-white p-3.5 shadow-[0_8px_24px_-20px_rgba(23,25,87,.25)] sm:p-4">
                  <Link href={`/students/${a.id}`} aria-label={`Open ${a.name}'s profile`} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b99b37]">
                    <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f2edda] text-sm font-bold text-[#171957] ring-1 ring-[#e8dfbd]">
                      {a.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start gap-1.5">
                        <h3 className="min-w-0 truncate font-semibold text-[#171957]">{a.name}</h3>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#e8dfbd] bg-[#f8f5e9] px-2 py-0.5 text-[11px] font-semibold text-[#6c5818]"><GraduationCap size={13} aria-hidden="true" />{a.className || 'Class not set'}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-neutral-500">{a.phone || 'Phone number not provided'}</p>
                      <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600">
                        <span className="inline-flex items-center gap-1"><MapPin size={13} aria-hidden="true" />{a.blockName || 'Block not set'}</span>
                        <span title={`Last call: ${a.callStatus ? label(CALL_STATUSES, a.callStatus) : 'Pending'}`} className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${a.callStatus === 'connected' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : a.callStatus === 'not_connected' || a.callStatus === 'busy' || a.callStatus === 'switched_off' ? 'border-amber-200 bg-amber-50 text-amber-700' : a.callStatus === 'invalid_number' || a.callStatus === 'disconnected' ? 'border-red-200 bg-red-50 text-red-700' : a.callStatus === 'call_back_requested' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-neutral-200 bg-neutral-100 text-neutral-600'}`}><Phone size={12} aria-hidden="true" />{a.callStatus ? label(CALL_STATUSES, a.callStatus) : 'Pending'}</span>
                      </div>
                    </div>
                  </Link>
                  {a.phone ? <a href={telHref(a.phone)} aria-label={`Call ${a.name}`} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 p-0 text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto sm:gap-2 sm:px-3"><Phone size={16} aria-hidden="true" /><span className="hidden sm:inline">Call</span></a> : <button type="button" disabled title="Phone number not provided" className="inline-flex h-10 w-10 shrink-0 cursor-not-allowed items-center justify-center rounded-xl bg-neutral-300 p-0 text-white sm:w-auto sm:gap-2 sm:px-3"><Phone size={16} aria-hidden="true" /><span className="hidden sm:inline">No phone</span></button>}
                </li>))}
            </ul>)}
        </section>)}
      <section className="mt-6"><h2 className="mb-2 font-medium">Recent call activity</h2>
        {!rows.length ? <p className="text-sm text-neutral-600">No calls recorded yet.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-neutral-600"><tr>
            <th className="p-2">Student</th><th>Block</th><th>By</th><th>Call</th><th>Interest</th><th>When</th></tr></thead><tbody>
            {rows.map((r) => (<tr key={r.id} className="border-b"><td className="p-2"><Link className="underline" href={`/students/${r.student_id}`}>{r.students?.student_name}</Link></td>
              <td>{r.students?.blocks?.name}</td><td>{r.profiles?.full_name}</td><td>{label(CALL_STATUSES, r.call_status)}</td>
              <td>{label(INTERESTS, r.interest_status)}</td><td>{fmt(r.created_at)}</td></tr>))}
          </tbody></table></div>)}
      </section>
      </div>
    </AppShell>
  );
}
