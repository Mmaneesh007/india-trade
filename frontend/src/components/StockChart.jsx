import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

export default function StockChart({ data, colors }) {
    const chartContainerRef = useRef();

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#374151', // Gray-700
            },
            grid: {
                vertLines: { color: 'rgba(0, 0, 0, 0.05)' },
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
            upColor: '#10b981',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });

        if (data && data.length > 0) {
            candleSeries.setData(data);
        } else {
            // Optional: Add a "No Data" marker or just leave grid
        }

        const volumeSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: { type: 'volume' },
            priceScaleId: '', // set as an overlay by setting a blank priceScaleId
        });

        volumeSeries.priceScale().applyOptions({
            scaleMargins: {
                top: 0.8, // highest point of the series will be 70% away from the top
                bottom: 0,
            },
        });

        // Transform data for volume if needed, or just skip volume for now
        // volumeSeries.setData(data.map(d => ({ time: d.time, value: d.volume, color: d.close > d.open ? '#10b98120' : '#ef444420' })));


        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data]);

    return <div ref={chartContainerRef} className="w-full h-[400px]" />;
}
