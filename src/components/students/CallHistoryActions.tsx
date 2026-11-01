'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import CallApplicationQuestions from '@/components/students/CallApplicationQuestions';
import { CALL_STATUSES, INTERESTS } from '@/lib/utils/labels';
import { isoToIstInput } from '@/lib/utils/ist';
import type { Row } from '@/lib/types';
import { deleteCallLog, updateCallLog } from '../../app/(workspace)/students/actions';

export default function CallHistoryActions({ call, studentId }: { call: Row; studentId: string }) {
  const [modal, setModal] = useState<'edit' | 'delete' | null>(null);

  useEffect(() => {
    if (!modal) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModal(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [modal]);

  return (
    <>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => setModal('edit')}
          aria-label="Edit call history"
          title="Edit call"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e9e4cf] text-[#34366e] transition hover:bg-[#f7f1d9] focus:outline-none focus:ring-2 focus:ring-[#b99b37]"
        >
          <Pencil size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setModal('delete')}
          aria-label="Delete call history"
          title="Delete call"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-700 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`call-modal-title-${call.id}`}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eeeadd] bg-white px-5 py-4">
              <h2 id={`call-modal-title-${call.id}`} className="text-lg font-semibold text-[#171957]">
                {modal === 'edit' ? 'Edit call history' : 'Delete call history'}
              </h2>
              <button
                type="button"
                onClick={() => setModal(null)}
                aria-label="Close dialog"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            {modal === 'edit' ? (
              <form action={updateCallLog} className="space-y-4 p-5">
                <input type="hidden" name="id" value={call.id} />
                <input type="hidden" name="student_id" value={studentId} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor={`call-status-${call.id}`}>Call status</label>
                    <select id={`call-status-${call.id}`} name="call_status" defaultValue={call.call_status} required className="input">
                      {CALL_STATUSES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor={`call-interest-${call.id}`}>Student interest</label>
                    <select id={`call-interest-${call.id}`} name="interest_status" defaultValue={call.interest_status} required className="input">
                      {INTERESTS.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
                    </select>
                  </div>
                </div>
                <CallApplicationQuestions
                  initialExamApplications={Array.isArray(call.exam_applications) ? call.exam_applications : []}
                  initialAdmitCardDownloaded={call.admit_card_downloaded}
                  initialInterestedOav={call.interested_oav}
                  initialMockTestStatus={call.mock_test_status}
                  idPrefix={`${call.id}-`}
                />
                <div>
                  <label className="label" htmlFor={`call-notes-${call.id}`}>Conversation notes</label>
                  <textarea id={`call-notes-${call.id}`} name="notes" rows={3} defaultValue={call.notes ?? ''} maxLength={2000} className="input min-h-24 resize-y py-3 leading-6" />
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#eeeadd] bg-[#fdfcf8] p-3">
                  <input type="checkbox" name="follow_up_required" defaultChecked={call.follow_up_required} className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-[#171957]" />
                  <span className="text-sm font-medium text-[#26274e]">Follow-up required</span>
                </label>
                <div>
                  <label className="label" htmlFor={`call-follow-up-${call.id}`}>Follow-up date and time (IST)</label>
                  <input id={`call-follow-up-${call.id}`} name="follow_up_at" type="datetime-local" defaultValue={isoToIstInput(call.follow_up_at)} className="input" />
                </div>
                <footer className="flex justify-end gap-2 border-t border-[#eeeadd] pt-4">
                  <button type="button" onClick={() => setModal(null)} className="btn-outline">Cancel</button>
                  <button className="btn">Save changes</button>
                </footer>
              </form>
            ) : (
              <div className="p-5">
                <p className="text-sm leading-6 text-neutral-600">
                  Delete this call history entry? Its linked follow-up will also be removed. This action cannot be undone.
                </p>
                <form action={deleteCallLog} className="mt-5 flex justify-end gap-2">
                  <input type="hidden" name="id" value={call.id} />
                  <input type="hidden" name="student_id" value={studentId} />
                  <button type="button" onClick={() => setModal(null)} className="btn-outline">Cancel</button>
                  <button className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2">
                    Delete call
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
