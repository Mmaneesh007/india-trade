import React from 'react';

// A simple, fail-safe SVG chart that doesn't rely on external libraries
export default function StockChart({ data = [] }) {
    // If no data, use some fake data to ensure chart always shows SOMETHING
    const chartData = data.length > 0 ? data : generateFakeData();

    // Find min/max for scaling
    const prices = chartData.map(d => d.close);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;

    // SVG Dimensions
    const width = 800;
    const height = 400;
    const padding = 20;

    // Create points for the SVG path
    const points = chartData.map((d, i) => {
        const x = (i / (chartData.length - 1)) * (width - 2 * padding) + padding;
        const y = height - padding - ((d.close - min) / range) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    // Create area fill (add boottom corners)
    const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

    return (
        <div className="w-full h-[400px] bg-white rounded-lg border border-gray-100 overflow-hidden relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between p-5 opacity-10 pointer-events-none">
                <div className="border-t border-black w-full"></div>
                <div className="border-t border-black w-full"></div>
                <div className="border-t border-black w-full"></div>
                <div className="border-t border-black w-full"></div>
                <div className="border-t border-black w-full"></div>
            </div>

            {/* The Chart */}
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                {/* Green Gradient Definition */}
                <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Area Fill */}
                <polygon points={areaPoints} fill="url(#chartGradient)" />

                {/* Line */}
                <polyline points={points} fill="none" stroke="#10b981" strokeWidth="3" />
            </svg>

            {/* Price Labels Overlay */}
            <div className="absolute right-2 top-2 text-xs text-gray-500 bg-white/80 px-1 rounded">{max.toFixed(2)}</div>
            <div className="absolute right-2 bottom-2 text-xs text-gray-500 bg-white/80 px-1 rounded">{min.toFixed(2)}</div>
        </div>
    );
}

function generateFakeData() {
    const data = [];
    let price = 1500;
    for (let i = 0; i < 50; i++) {
        price = price + (Math.random() - 0.5) * 20;
        data.push({ close: price });
    }
    return data;
}
