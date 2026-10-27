import { notFound } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { requireProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { telHref } from '@/lib/utils/phone';
import { CALL_STATUSES, INTERESTS } from '@/lib/utils/labels';
import { recordCall } from '../../actions';

export default async function RecordCall({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const profile = await requireProfile();
  const { id } = await params; const { error } = await searchParams;
  const supabase = await createClient();
  const { data: s } = await supabase.from('students').select('id, student_name, phone_number, interest_status').eq('id', id).maybeSingle();
  if (!s) notFound();
  const initials = String(s.student_name ?? '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return (
    <AppShell profile={profile} title="Record call result">
      <div className="mx-auto max-w-5xl">
        <Link href={`/students/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-[#171957]">← <span>Back to student profile</span></Link>
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {profile.role === 'admin' ? <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Only a correspondent assigned to this block can record calls.</div> : (
          <>
            <div className="mt-5 overflow-hidden rounded-2xl border border-[#e9e4cf] bg-white shadow-[0_14px_38px_-28px_rgba(23,25,87,.35)]">
              <div className="flex flex-col gap-5 bg-gradient-to-br from-[#fffdf6] to-white px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div className="flex min-w-0 items-center gap-4">
                  <div aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f7f1d9] text-lg font-semibold text-[#776117]">{initials}</div>
                  <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[.12em] text-[#81754b]">Student contact</p><h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-[#171957]">{s.student_name}</h2><p className="mt-1 text-sm text-neutral-500">{s.phone_number || 'Phone number not provided'}</p></div>
                </div>
                {s.phone_number && <a href={telHref(s.phone_number)} className="btn w-full sm:w-auto"><span aria-hidden="true">☎</span> Call student</a>}
              </div>
              <div className="flex items-start gap-3 border-t border-[#eeeadd] bg-[#fbfaf6] px-5 py-3.5 text-sm text-neutral-600 sm:px-8"><span className="mt-0.5 text-[#8b7424]" aria-hidden="true">ⓘ</span><p>Calling opens your phone dialer. Return here to record the outcome; calls are not logged automatically.</p></div>
            </div>

            <form action={recordCall} className="mt-5">
              <input type="hidden" name="student_id" value={s.id} /><input type="hidden" name="request_id" value={crypto.randomUUID()} />
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
                <div className="overflow-hidden rounded-2xl border border-[#e9e4cf] bg-white shadow-[0_8px_24px_-20px_rgba(23,25,87,.25)]">
                  <div className="border-b border-[#eeeadd] px-5 py-4 sm:px-7"><p className="text-xs font-semibold uppercase tracking-[.12em] text-[#8b7424]">Call summary</p><h3 className="mt-1 text-lg font-semibold text-[#171957]">How did the conversation go?</h3><p className="mt-1 text-sm text-neutral-500">Capture the outcome and what the student is interested in.</p></div>
                  <div className="space-y-5 p-5 sm:p-7">
                    <div><label className="label" htmlFor="call_status">Call status <span className="text-red-600">*</span></label><select id="call_status" name="call_status" required className="input"><option value="" disabled>Select a call outcome</option>{CALL_STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
                    <div><label className="label" htmlFor="interest_status">Student interest</label><select id="interest_status" name="interest_status" defaultValue={s.interest_status} className="input">{INTERESTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
                    <div><label className="label" htmlFor="notes">Conversation notes <span className="font-normal text-neutral-400">(optional)</span></label><textarea id="notes" name="notes" rows={5} placeholder="Key questions, information shared, or next steps…" className="input min-h-32 resize-y py-3 leading-6" /></div>
                  </div>
                </div>
                <aside className="flex flex-col gap-5">
                  <div className="rounded-2xl border border-[#e9e4cf] bg-white p-5 shadow-[0_8px_24px_-20px_rgba(23,25,87,.25)] sm:p-6">
                    <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#8b7424]">Next step</p><h3 className="mt-1 text-lg font-semibold text-[#171957]">Plan a follow-up</h3><p className="mt-1 text-sm leading-5 text-neutral-500">Set a reminder if this student needs another check-in.</p>
                    <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-[#eeeadd] bg-[#fdfcf8] p-3.5"><input type="checkbox" name="follow_up_required" className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-[#171957]" /><span><span className="block text-sm font-medium text-[#26274e]">Follow-up required</span><span className="mt-0.5 block text-xs text-neutral-500">Add a date and time below</span></span></label>
                    <div className="mt-4"><label className="label" htmlFor="follow_up_at">Follow-up date and time <span className="font-normal text-neutral-400">(IST)</span></label><input id="follow_up_at" name="follow_up_at" type="datetime-local" className="input" /></div>
                  </div>
                  <div className="rounded-2xl border border-[#e9e4cf] bg-[#fbfaf6] p-5 text-sm leading-5 text-neutral-600"><p className="font-semibold text-[#26274e]">Before you save</p><p className="mt-1.5">Check the call status and add any useful details from the conversation. Your entry will be added to the student’s call history.</p></div>
                </aside>
              </div>
              <div className="mt-5 flex flex-col-reverse gap-3 rounded-2xl border border-[#e9e4cf] bg-white p-4 shadow-[0_8px_24px_-20px_rgba(23,25,87,.25)] sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-xs text-neutral-500">Your call result will be saved to this student’s record.</p><div className="flex flex-col-reverse gap-2 sm:flex-row"><Link href={`/students/${id}`} className="btn-outline">Cancel</Link><button className="btn">Save call result <span aria-hidden="true">→</span></button></div></div>
            </form>
          </>
        )}
      </div>
    </AppShell>
  );
}
