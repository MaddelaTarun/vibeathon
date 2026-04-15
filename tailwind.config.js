/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'command': {
          bg: '#0a0e14',
          panel: '#151a21',
          border: '#1f2937',
          text: '#e5e7eb',
          muted: '#6b7280',
        },
        'status': {
          critical: '#ef4444',
          warning: '#f59e0b',
          optimal: '#10b981',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'stress-pulse': 'stress-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'stress-pulse': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
