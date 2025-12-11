import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from './Chart';

export default function StockPage({ symbol }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if(!symbol) return;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await axios.get(`/api/quotes/latest/${symbol}`);
        if(!cancelled) setData(res.data);
      } catch(e) {
        console.error(e);
      } finally { if(!cancelled) setLoading(false); }
    }
    load();
    const id = setInterval(load, 5000);
    return ()=>{ cancelled = true; clearInterval(id); }
  }, [symbol]);

  return (
    <div>
      <h2>{symbol}</h2>
      {loading && <div>Loading...</div>}
      <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(data, null, 2)}</pre>
      <Chart symbol={symbol} />
    </div>
  );
}
