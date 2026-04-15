/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'grilli': {
          black: '#0a0a0b',
          dark: '#121214',
          surface: '#1a1a1c',
          card: '#222225',
          gold: '#c5a373',
          gold_muted: '#8e795c',
          text: '#e1e1e1',
          muted: '#9ca3af',
          border: '#2a2a2e',
        },
        'status': {
          critical: '#ff4d4d',
          warning: '#ffb347',
          optimal: '#2ecc71',
          info: '#3498db',
        },
      },
      fontFamily: {
        'serif': ['"Instrument Serif"', 'serif'],
        'sans': ['"Inter"', 'system-ui', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 15px rgba(197, 163, 115, 0.15)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(to right, #c5a373, #e8d2b5)',
      }
    },
  },
  plugins: [],
}
