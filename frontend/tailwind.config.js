/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── EcoTrust Brand Colors ───────────────────
        eco: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        forest: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        earth: {
          50:  '#faf8f5',
          100: '#f0ebe3',
          200: '#e0d5c5',
          300: '#cdb9a1',
          400: '#b8997c',
          500: '#a88264',
          600: '#9b7158',
          700: '#815c4a',
          800: '#6a4d40',
          900: '#574036',
          950: '#2e201b',
        },
        dark: {
          50:  '#f6f6f7',
          100: '#e2e3e5',
          200: '#c4c6cb',
          300: '#9fa2aa',
          400: '#7b7f89',
          500: '#61656f',
          600: '#4d5059',
          700: '#3f4249',
          800: '#36383e',
          900: '#1e1f23',
          950: '#131316',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'eco': '0 4px 14px 0 rgba(34, 197, 94, 0.15)',
        'eco-lg': '0 10px 25px -3px rgba(34, 197, 94, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
        'dark': '0 4px 14px 0 rgba(0, 0, 0, 0.25)',
      },
      backgroundImage: {
        'gradient-eco': 'linear-gradient(135deg, #065f46 0%, #10b981 50%, #34d399 100%)',
        'gradient-forest': 'linear-gradient(135deg, #134e4a 0%, #14b8a6 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1e1f23 0%, #36383e 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};
