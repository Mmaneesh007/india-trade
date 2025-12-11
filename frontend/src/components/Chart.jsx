import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import axios from 'axios';

export default function Chart({ symbol }) {
  const ref = useRef();

  useEffect(()=>{
    const container = ref.current;
    if(!container) return;
    const chart = createChart(container, { width: 800, height: 360 });
    const candleSeries = chart.addCandlestickSeries();

    let cancelled = false;
    async function loadCandles() {
      try {
        const res = await axios.get(`/api/quotes/candles/${symbol}?range=100`);
        const candles = (res.data && res.data.candles) || [];
        candleSeries.setData(candles);
      } catch (e) {
        console.error('Failed to load candles', e);
      }
    }
    loadCandles();
    const id = setInterval(loadCandles, 15000);
    window.addEventListener('resize', ()=> chart.applyOptions({ width: container.clientWidth }));
    return ()=>{ cancelled = true; clearInterval(id); chart.remove(); };
  }, [symbol]);

  return <div ref={ref} />;
}
