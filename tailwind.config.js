/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,html}'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#06185c', 800: '#0a2380', 700: '#0d2f9e', 600: '#1239b8' },
        brand: { DEFAULT: '#1357d6', dark: '#0e44ab', light: '#e8effc' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px -10px rgba(3, 14, 70, 0.55)',
      },
    },
  },
  plugins: [],
};
