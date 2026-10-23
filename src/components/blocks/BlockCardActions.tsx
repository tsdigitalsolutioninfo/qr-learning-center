'use client';

import { useEffect, useState } from 'react';
import { Pencil, Power, X } from 'lucide-react';
import { editBlock, toggleBlock } from '@/app/(workspace)/blocks/actions';

export default function BlockCardActions({ id, name, active }: { id: string; name: string; active: boolean }) {
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setEditing(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editing]);

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={() => setEditing(true)} aria-label={`Edit ${name}`} title="Edit block" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ded8bf] bg-white text-[#171957] transition hover:bg-[#fcfaef] focus:outline-none focus:ring-4 focus:ring-[#d3b13b]/15">
          <Pencil aria-hidden="true" size={17} />
        </button>
        <form action={toggleBlock}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="active" value={String(active)} />
          <button type="submit" aria-label={`${active ? 'Deactivate' : 'Activate'} ${name}`} title={active ? 'Deactivate block' : 'Activate block'} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ded8bf] bg-white text-[#171957] transition hover:bg-[#fcfaef] focus:outline-none focus:ring-4 focus:ring-[#d3b13b]/15">
            <Power aria-hidden="true" size={17} className={active ? '' : 'text-neutral-400'} />
          </button>
        </form>
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setEditing(false);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby={`edit-block-title-${id}`} className="w-full max-w-md rounded-2xl border border-[#e9e4cf] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id={`edit-block-title-${id}`} className="text-lg font-semibold text-[#171957]">Edit block</h2>
              <button type="button" aria-label="Close dialog" onClick={() => setEditing(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100">
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <form action={editBlock} className="grid gap-3">
              <input type="hidden" name="id" value={id} />
              <label htmlFor={`edit-block-name-${id}`} className="sr-only">Block name</label>
              <input id={`edit-block-name-${id}`} name="name" defaultValue={name} required minLength={2} maxLength={100} autoFocus className="input" />
              <button className="btn w-full">Save changes</button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
