'use client';

import { useState } from 'react';

const exams = [
  { value: 'jnv', label: 'JNV' },
  { value: 'oav', label: 'OAV' },
  { value: 'none', label: 'None of these' },
];

function YesNoQuestion({ name, label }: { name: string; label: string }) {
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
              className="h-4 w-4 accent-[#171957]"
            />
            {answer === 'yes' ? 'Yes' : 'No'}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function CallApplicationQuestions() {
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const hasJnv = selectedExams.includes('jnv');

  function toggleExam(value: string) {
    setSelectedExams((current) => {
      if (value === 'none') return current.includes('none') ? [] : ['none'];
      const examsOnly = current.filter((exam) => exam !== 'none');
      return examsOnly.includes(value)
        ? examsOnly.filter((exam) => exam !== value)
        : [...examsOnly, value];
    });
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
        />
      )}
      <YesNoQuestion
        name="interested_oav"
        label="Is the student interested in applying for OAV?"
      />
    </section>
  );
}
