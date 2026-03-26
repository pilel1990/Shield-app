/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shield: {
          red: '#DC2626',
          dark: '#111827',
          card: '#1F2937',
          border: '#374151',
          text: '#9CA3AF',
          gold: '#F59E0B',
          green: '#10B981',
          blue: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
