/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bistro': {
          bg: '#faf9f6', // Warm paper/cream
          surface: '#ffffff',
          card: '#ffffff',
          border: '#e2e8f0',
          text: '#1e293b',
          muted: '#64748b',
          accent: '#0f172a',
        },
        'status': {
          critical: '#ef4444', // Rose
          warning: '#f59e0b', // Amber
          optimal: '#10b981', // Emerald
          info: '#3b82f6', // Blue
        },
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'elevated': '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
      },
    },
  },
  plugins: [],
}
