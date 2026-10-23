'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { addDistrict } from '@/app/(workspace)/districts/actions';

export default function AddDistrictModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <button type="button" className="btn shrink-0 px-3" onClick={() => setOpen(true)}>
        Add district
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="add-district-title" className="w-full max-w-md rounded-2xl border border-[#e9e4cf] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="add-district-title" className="text-lg font-semibold text-[#171957]">Add district</h2>
              <button type="button" aria-label="Close dialog" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100">
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <form action={addDistrict} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="new-district-name" className="sr-only">District name</label>
              <input id="new-district-name" name="name" required minLength={2} maxLength={100} autoFocus placeholder="District name" className="input" />
              <button className="btn shrink-0">Add</button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
