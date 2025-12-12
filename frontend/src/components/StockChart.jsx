import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

export default function StockChart({ data = [] }) {
    const chartContainerRef = useRef();

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Clean up previous chart if any (though StrictMode might run this twice, we handle it via return cleanup)
        chartContainerRef.current.innerHTML = '';

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#374151', // Gray-700 (Dark text for Light Theme)
            },
            grid: {
                vertLines: { color: 'rgba(0, 0, 0, 0.05)' }, // Subtle grid
                horzLines: { color: 'rgba(0, 0, 0, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            timeScale: {
                borderColor: 'rgba(0, 0, 0, 0.1)',
                timeVisible: true,
            },
        });

        chart.timeScale().fitContent();

        const candleSeries = chart.addCandlestickSeries({
            upColor: '#10b981', // Groww Green
            downColor: '#ef4444', // Groww Red
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });

        // Ensure we preserve data even if empty to show the grid
        if (data && data.length > 0) {
            candleSeries.setData(data);
        }

        // Responsive Resizing
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data]);

    return (
        <div
            ref={chartContainerRef}
            className="w-full h-[400px] bg-white text-black rounded-lg overflow-hidden"
            style={{ position: 'relative' }}
        >
            {/* If really no data, show a subtle loading/empty state overlay */}
            {(!data || data.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="text-gray-400 text-sm">Waiting for Market Data...</span>
                </div>
            )}
        </div>
    );
}
