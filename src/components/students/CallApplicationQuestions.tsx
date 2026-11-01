'use client';

import { useState } from 'react';
import { MOCK_TEST_STATUSES } from '@/lib/utils/labels';

const exams = [
  { value: 'jnv', label: 'JNV' },
  { value: 'oav', label: 'OAV' },
  { value: 'none', label: 'None of these' },
];

function YesNoQuestion({ name, label, initialValue }: { name: string; label: string; initialValue?: boolean | null }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-[#26274e]">{label}</legend>
      <div className="mt-2 flex gap-4">
        {['yes', 'no'].map((answer) => (
          <label key={answer} className="inline-flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <input
              type="radio"
              name={name}
              value={answer}
              defaultChecked={initialValue === (answer === 'yes')}
              className="h-4 w-4 accent-[#171957]"
            />
            {answer === 'yes' ? 'Yes' : 'No'}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type CallApplicationQuestionsProps = {
  initialExamApplications?: string[];
  initialAdmitCardDownloaded?: boolean | null;
  initialInterestedOav?: boolean | null;
  initialMockTestStatus?: string | null;
  idPrefix?: string;
};

export default function CallApplicationQuestions({
  initialExamApplications = [],
  initialAdmitCardDownloaded = null,
  initialInterestedOav = null,
  initialMockTestStatus = null,
  idPrefix = '',
}: CallApplicationQuestionsProps = {}) {
  const [selectedExams, setSelectedExams] = useState<string[]>(initialExamApplications);
  const [mockTestStatus, setMockTestStatus] = useState(initialMockTestStatus ?? '');
  const hasJnv = selectedExams.includes('jnv');
  const hasMockTestApplication = selectedExams.includes('jnv') || selectedExams.includes('oav');

  function toggleExam(value: string) {
    const nextExams = value === 'none'
      ? selectedExams.includes('none') ? [] : ['none']
      : selectedExams.includes(value)
        ? selectedExams.filter((exam) => exam !== value)
        : [...selectedExams.filter((exam) => exam !== 'none'), value];
    setSelectedExams(nextExams);
    if (!nextExams.includes('jnv') && !nextExams.includes('oav')) setMockTestStatus('');
  }

  return (
    <section className="space-y-5 rounded-xl border border-[#eeeadd] bg-[#fdfcf8] p-4">
      <fieldset>
        <legend className="text-sm font-medium text-[#26274e]">Has the student applied for?</legend>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
          {exams.map(({ value, label }) => (
            <label key={value} className="inline-flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                name="exam_applications"
                value={value}
                checked={selectedExams.includes(value)}
                onChange={() => toggleExam(value)}
                className="h-4 w-4 rounded border-neutral-300 accent-[#171957]"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      {hasJnv && (
        <YesNoQuestion
          name="admit_card_downloaded"
          label="Has the student downloaded the JNV admit card?"
          initialValue={initialAdmitCardDownloaded}
        />
      )}
      <div>
        <label className="label" htmlFor={`${idPrefix}mock_test_status`}>Mock test status</label>
        <select
          id={`${idPrefix}mock_test_status`}
          name="mock_test_status"
          value={hasMockTestApplication ? mockTestStatus : ''}
          onChange={(event) => setMockTestStatus(event.target.value)}
          disabled={!hasMockTestApplication}
          className="input disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
        >
          <option value="">Select a mock test status</option>
          {MOCK_TEST_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        {!hasMockTestApplication && <p className="mt-1 text-xs text-neutral-500">Select JNV or OAV above to enable this field.</p>}
      </div>
      <YesNoQuestion
        name="interested_oav"
        label="Is the student interested in applying for OAV?"
        initialValue={initialInterestedOav}
      />
    </section>
  );
}
