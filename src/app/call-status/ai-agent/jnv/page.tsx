import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, PhoneCall } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { CALL_STATUSES, label } from '@/lib/utils/labels';
import { createAdminClient } from '@/lib/supabase/admin';

const PAGE_SIZE = 50;

type PublicCall = {
  id: string;
  student_name: string;
  call_status: string;
  created_at: string;
};

type CallRecord = {
  id: string;
  call_status: string;
  created_at: string;
  students: { student_name: string } | { student_name: string }[] | null;
};

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

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));

export default async function PublicJnvCallStatus({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam === undefined ? 1 : Number(pageParam);
  if (!Number.isSafeInteger(page) || page < 1 || (page - 1) * PAGE_SIZE > 2_147_483_647) notFound();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('call_logs')
    .select('id, call_status, created_at, students!inner(student_name)')
    .contains('exam_applications', ['jnv'])
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  if (error) throw new Error(`Unable to load public JNV call status: ${error.message}`);

  const calls: PublicCall[] = ((data ?? []) as unknown as CallRecord[]).map((call) => {
    const student = Array.isArray(call.students) ? call.students[0] : call.students;
    if (!student?.student_name) throw new Error('A JNV call record is missing its student name.');
    return {
      id: call.id,
      student_name: student.student_name,
      call_status: call.call_status,
      created_at: call.created_at,
    };
  });
  const hasNextPage = calls.length > PAGE_SIZE;
  const visibleCalls = calls.slice(0, PAGE_SIZE);

  return (
    <AppShell guest title="JNV Call Status">
      <div className="mx-auto max-w-4xl text-[#20213f]">
        <header className="rounded-3xl border border-[#e9e4cf] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbf5dc] text-[#776117]">
            <PhoneCall aria-hidden="true" size={22} />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a711d]">Jawahar Navodaya Vidyalaya</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#171957] sm:text-3xl">Call status</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Recent JNV call outcomes. Times are shown in Indian Standard Time.
          </p>
        </header>

        <section aria-label="JNV call results" className="mt-6">
          {visibleCalls.length === 0 ? (
            <div className="rounded-2xl border border-[#e9e4cf] bg-white px-5 py-10 text-center text-sm text-neutral-600">
              No JNV call records found.
            </div>
          ) : (
            <ul className="divide-y divide-[#eeeadd] overflow-hidden rounded-2xl border border-[#e9e4cf] bg-white">
              {visibleCalls.map((call) => (
                <li key={call.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link href={`/call-status/ai-agent/jnv/${call.id}`} className="font-semibold text-[#171957] underline-offset-4 hover:text-[#8a711d] hover:underline">
                    {call.student_name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle(call.call_status)}`}>
                      {label(CALL_STATUSES, call.call_status)}
                    </span>
                    <time dateTime={call.created_at} className="text-xs text-neutral-500">
                      {formatDate(call.created_at)}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {(page > 1 || hasNextPage) && (
          <nav aria-label="Call results pages" className="mt-5 flex items-center justify-between">
            {page > 1 ? (
              <Link href={`/call-status/ai-agent/jnv?page=${page - 1}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#ded8bf] bg-white px-4 text-sm font-semibold text-[#171957] hover:bg-[#fcfaef]">
                <ArrowLeft aria-hidden="true" size={15} /> Newer calls
              </Link>
            ) : <span />}
            {hasNextPage && (
              <Link href={`/call-status/ai-agent/jnv?page=${page + 1}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#ded8bf] bg-white px-4 text-sm font-semibold text-[#171957] hover:bg-[#fcfaef]">
                Older calls <ArrowRight aria-hidden="true" size={15} />
              </Link>
            )}
          </nav>
        )}
      </div>
    </AppShell>
  );
}
