/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Light "ice" palette: navy-* now maps to a clean white-on-light scheme.
      colors: {
        navy: {
          950: '#eaf0f8', // page background (very light blue-grey)
          900: '#ffffff', // panel surface
          800: '#f2f6fc', // inset / wells
          700: '#dfe7f1', // borders
          600: '#c6d2e2', // stronger borders / tracks
          500: '#9fb0c8',
          400: '#7d92b0',
        },
        // Deep accents for legibility on white.
        stream1: '#0891b2', // cyan-600
        stream2: '#d97706', // amber-600
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)',
        card: '0 1px 3px rgba(15,23,42,0.05), 0 12px 32px rgba(15,23,42,0.07)',
      },
    },
  },
  plugins: [],
}
