import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, PhoneCall } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { CALL_STATUSES, INTERESTS, MOCK_TEST_STATUSES, label } from '@/lib/utils/labels';
import { createAdminClient } from '@/lib/supabase/admin';

type CallRecord = {
  call_status: string;
  interest_status: string;
  exam_applications: string[] | null;
  admit_card_downloaded: boolean | null;
  interested_oav: boolean | null;
  mock_test_status: string | null;
  created_at: string;
  students: { student_name: string } | { student_name: string }[] | null;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));

const answer = (value: boolean | null) => value === null ? 'Not recorded' : value ? 'Yes' : 'No';

export default async function PublicJnvCallRecord({
  params,
}: {
  params: Promise<{ callId: string }>;
}) {
  const { callId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(callId)) notFound();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('call_logs')
    .select('call_status, interest_status, exam_applications, admit_card_downloaded, interested_oav, mock_test_status, created_at, students!inner(student_name)')
    .eq('id', callId)
    .contains('exam_applications', ['jnv'])
    .maybeSingle();
  if (error) throw new Error(`Unable to load public JNV call record: ${error.message}`);
  if (!data) notFound();

  const call = data as unknown as CallRecord;
  const student = Array.isArray(call.students) ? call.students[0] : call.students;
  if (!student?.student_name) throw new Error('A JNV call record is missing its student name.');

  const applications = (call.exam_applications ?? [])
    .filter((exam) => exam === 'jnv' || exam === 'oav')
    .map((exam) => exam.toUpperCase());

  return (
    <AppShell guest title="JNV Call Record">
      <div className="mx-auto max-w-4xl text-[#20213f]">
        <Link href="/call-status/ai-agent/jnv" className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#171957] hover:text-[#8a711d]">
          <ArrowLeft aria-hidden="true" size={16} /> Back to JNV call status
        </Link>
        <section className="rounded-3xl border border-[#e9e4cf] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbf5dc] text-[#776117]">
            <PhoneCall aria-hidden="true" size={22} />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a711d]">JNV call result</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#171957] sm:text-3xl">{student.student_name}</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Recorded <time dateTime={call.created_at}>{formatDate(call.created_at)}</time> (IST)
          </p>

          <dl className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#eeeadd] bg-[#fdfcf8] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Call outcome</dt>
              <dd className="mt-1 font-semibold text-[#171957]">{label(CALL_STATUSES, call.call_status)}</dd>
            </div>
            <div className="rounded-2xl border border-[#eeeadd] bg-[#fdfcf8] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Interest status</dt>
              <dd className="mt-1 font-semibold text-[#171957]">{label(INTERESTS, call.interest_status)}</dd>
            </div>
            <div className="rounded-2xl border border-[#eeeadd] bg-[#fdfcf8] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Applied for</dt>
              <dd className="mt-1 font-semibold text-[#171957]">{applications.length ? applications.join(', ') : 'Not recorded'}</dd>
            </div>
            <div className="rounded-2xl border border-[#eeeadd] bg-[#fdfcf8] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">JNV admit card downloaded</dt>
              <dd className="mt-1 font-semibold text-[#171957]">{answer(call.admit_card_downloaded)}</dd>
            </div>
            <div className="rounded-2xl border border-[#eeeadd] bg-[#fdfcf8] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Interested in OAV</dt>
              <dd className="mt-1 font-semibold text-[#171957]">{answer(call.interested_oav)}</dd>
            </div>
            <div className="rounded-2xl border border-[#eeeadd] bg-[#fdfcf8] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Mock test status</dt>
              <dd className="mt-1 font-semibold text-[#171957]">{label(MOCK_TEST_STATUSES, call.mock_test_status)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </AppShell>
  );
}
