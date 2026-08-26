/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#0caf3d', // Core vibrant agri green
          600: '#0aae3f',
          700: '#088a31',
          800: '#0d6b28',
          900: '#0e5222',
          950: '#063013',
        },
        agri: {
          surface: '#ffffff',
          bg: '#f6faf6',
          subtle: '#eaf6ed',
          border: '#e1ede4',
          heading: '#0c381a',
          text: '#1f2937',
          muted: '#6b7280',
          dark: '#082813',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '"Noto Sans Devanagari"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Outfit', '"Plus Jakarta Sans"', '"Noto Sans Devanagari"', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'agri': '0 2px 8px -2px rgba(12, 175, 61, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'agri-lg': '0 10px 25px -5px rgba(12, 175, 61, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
