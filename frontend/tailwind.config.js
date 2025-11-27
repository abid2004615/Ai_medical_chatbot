/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00B8D9',
        accent: '#008080',
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#0F172A',
          900: '#0f172a',
        },
        dark: {
          background: '#0f0f1e',
          secondary: '#1a1a2e',
          surface: '#16213e',
          'surface-light': '#1e2d4f',
          border: '#2a3a5a',
          text: {
            primary: '#ffffff',
            secondary: '#b0b0c0',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'gradient-medical': 'linear-gradient(180deg, #E9FBFB 0%, #F7FFFF 100%)',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 184, 217, 0.1)',
      },
    },
  },
  plugins: [],
}
