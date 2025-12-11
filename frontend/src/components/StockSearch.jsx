import React, { useState } from 'react';

export default function StockSearch({ onSearch }) {
  const [q, setQ] = useState('RELIANCE');
  return (
    <div className='search'>
      <input value={q} onChange={e=>setQ(e.target.value)} />
      <button onClick={()=>onSearch(q.trim().toUpperCase())}>Search</button>
    </div>
  );
}
