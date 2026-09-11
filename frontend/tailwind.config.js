/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#b8d1ff',
          300: '#8ab0ff',
          400: '#5586fc',
          500: '#2f5df0',
          600: '#1f42d1',
          700: '#1c34a6',
          800: '#1a2e84',
          900: '#131f5c',
          950: '#0b1338',
        },
        signal: {
          50: '#fff8ec',
          100: '#ffedc7',
          200: '#ffd98a',
          300: '#ffbe4d',
          400: '#ffa41f',
          500: '#f98407',
          600: '#dd6203',
          700: '#b74506',
          800: '#94360c',
          900: '#792d0d',
        },
        violet: {
          500: '#7c5cff',
          600: '#6640f5',
          700: '#5330d1',
        },
        surface: {
          light: '#f3f5fc',
          dark: '#080d1c',
        },
        panel: {
          light: 'rgba(255,255,255,0.78)',
          dark: 'rgba(15,21,42,0.68)',
        },
        success: '#17b26a',
        warning: '#f79009',
        danger: '#f04438',
        info: '#2f5df0',
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(11, 19, 56, 0.12)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        premium: '0 20px 60px -12px rgba(31, 66, 209, 0.35)',
        card: '0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.1)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
        '3xl': '28px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.94)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: 0.8 },
          '80%, 100%': { transform: 'scale(1.8)', opacity: 0 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.45s ease-out both',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.2,0.6,0.4,1) infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
