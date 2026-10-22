'use client';
import { useState } from 'react';
type D = { id: string; name: string; blocks: { id: string; name: string }[] };
export default function DistrictBlockSelect({ districts }: { districts: D[] }) {
  const [district, setDistrict] = useState(districts[0]?.id ?? '');
  const [block, setBlock] = useState('');
  const blocks = districts.find((d) => d.id === district)?.blocks ?? [];
  return (
    <>
      <div><label className="label" htmlFor="district_id">District</label>
        <select id="district_id" name="district_id" required className="input" value={district}
          onChange={(e) => { setDistrict(e.target.value); setBlock(''); }}>
          {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select></div>
      <div><label className="label" htmlFor="block_id">Block</label>
        <select id="block_id" name="block_id" required className="input" value={block} onChange={(e) => setBlock(e.target.value)}>
          <option value="" disabled>Select block</option>
          {blocks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select></div>
    </>
  );
}
