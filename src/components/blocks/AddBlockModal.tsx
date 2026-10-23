'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { addBlock } from '@/app/(workspace)/blocks/actions';
import { createClient } from '@/lib/supabase/client';

type District = { id: string; name: string };

export default function AddBlockModal() {
  const [open, setOpen] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const { data, error } = await createClient().from('districts').select('id, name').eq('is_active', true).order('name');
        if (error) throw error;
        if (!cancelled) setDistricts(data ?? []);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  return (
    <>
      <button type="button" className="btn shrink-0 px-3" onClick={() => setOpen(true)}>
        Add block
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="add-block-title" className="w-full max-w-md rounded-2xl border border-[#e9e4cf] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="add-block-title" className="text-lg font-semibold text-[#171957]">Add block</h2>
              <button type="button" aria-label="Close dialog" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100">
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            {loading ? <p className="py-3 text-sm text-neutral-600">Loading districts…</p> : loadError ? (
              <p role="alert" className="text-sm text-red-700">Could not load districts. Close this dialog and try again.</p>
            ) : !districts.length ? (
              <p className="text-sm text-neutral-600">Add an active <Link className="underline" href="/districts" onClick={() => setOpen(false)}>district</Link> before adding a block.</p>
            ) : (
              <form action={addBlock} className="grid gap-3">
                <div>
                  <label className="label" htmlFor="new-block-district">District</label>
                  <select id="new-block-district" name="district_id" required className="input">
                    {districts.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="new-block-name">Block name</label>
                  <input id="new-block-name" name="name" required minLength={2} maxLength={100} autoFocus className="input" />
                </div>
                <button className="btn w-full">Add block</button>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
