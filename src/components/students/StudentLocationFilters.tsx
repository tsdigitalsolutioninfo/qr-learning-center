'use client';

import { useState } from 'react';

type District = {
  id: string;
  name: string;
  blocks: { id: string; name: string }[];
};

export default function StudentLocationFilters({
  districts,
  selectedDistrict,
  selectedBlock,
}: {
  districts: District[];
  selectedDistrict: string;
  selectedBlock: string;
}) {
  const [district, setDistrict] = useState(selectedDistrict);
  const [block, setBlock] = useState(selectedBlock);
  const blocks = districts.find((option) => option.id === district)?.blocks ?? [];

  return (
    <>
      <select
        name="district"
        value={district}
        onChange={(event) => {
          setDistrict(event.target.value);
          setBlock('');
        }}
        className="input"
        aria-label="District"
      >
        <option value="">All districts</option>
        {districts.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
      </select>
      <select
        name="block"
        value={block}
        onChange={(event) => setBlock(event.target.value)}
        className="input"
        aria-label="Block"
        disabled={!district}
      >
        {district
          ? <option value="">All blocks</option>
          : <option value="">Select a district first</option>}
        {blocks.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
      </select>
    </>
  );
}
