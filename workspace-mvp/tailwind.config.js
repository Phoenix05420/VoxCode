/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c7c7c7',
          300: '#a3a3a3',
          400: '#818181',
          500: '#646464',
          600: '#4d4d4d',
          700: '#323232',
          800: '#252525',
          900: '#1a1a1a',
        },
        accent: {
          blue: '#3b82f6',
          purple: '#a855f7',
          pink: '#ec4899',
        }
      },
      spacing: {
        'topbar': '64px',
        'sidebar': '280px',
      },
      fontFamily: {
        mono: ['Monaco', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
