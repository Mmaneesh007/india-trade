import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

export default function StockChart({ data = [] }) {
    const chartContainerRef = useRef();
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // 1. Create Chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'white' },
                textColor: 'black',
            },
            grid: {
                vertLines: { color: '#e5e7eb' }, // visible gray
                horzLines: { color: '#e5e7eb' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            rightPriceScale: {
                borderColor: '#e5e7eb',
            },
            timeScale: {
                borderColor: '#e5e7eb',
                timeVisible: true,
            },
        });
        chartRef.current = chart;

        // 2. Add Series
        const candleSeries = chart.addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });

        // 3. Set Data
        if (data && data.length > 0) {
            candleSeries.setData(data);
            chart.timeScale().fitContent();
        }

        // 4. Robust Resizing with ResizeObserver
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries.length === 0 || !entries[0].target) return;
            const newRect = entries[0].contentRect;
            if (newRect.width > 0) {
                chart.applyOptions({ width: newRect.width, height: newRect.height });
                chart.timeScale().fitContent();
            }
        });
        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
    }, [data]);

    return (
        <div className="relative w-full h-[400px]">
            <div
                ref={chartContainerRef}
                className="w-full h-full bg-white rounded-lg overflow-hidden border border-gray-100"
            />
            {/* Debug Overlay: To confirm data is arriving */}
            <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-[10px] px-2 py-1 rounded z-20 pointer-events-none opacity-50">
                Debug: {data ? data.length : 0} candles
            </div>
        </div>
    );
}
