/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'groww-bg': '#F5F7F8',      // Light gray background
                'groww-card': '#FFFFFF',    // White card
                'groww-primary': '#00D09C', // The signature Green
                'groww-red': '#EB5B3C',     // The signature Red
                'groww-blue': '#5367FF',    // Primary action buttons
                'groww-text-main': '#44475B', // Dark slate text
                'groww-text-muted': '#7C7E8C', // Gray text
                'groww-border': '#E5E7EB',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Groww uses Roboto/Inter mix, Inter is close enough
            },
            boxShadow: {
                'sm': '0 1px 3px rgba(0,0,0,0.05)',
                'card': '0 2px 8px rgba(0,0,0,0.05)',
            }
        },
    },
    plugins: [],
}
