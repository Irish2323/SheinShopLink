/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Clash Display"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef1',
          200: '#d9dde3',
          300: '#b5bcc7',
          400: '#8b95a5',
          500: '#6d7889',
          600: '#576070',
          700: '#474e5b',
          800: '#3d434e',
          900: '#2a2e36',
          950: '#1b1e24',
        },
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(23, 26, 33, 0.12)',
        lift: '0 14px 40px -12px rgba(88, 28, 135, 0.25)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}