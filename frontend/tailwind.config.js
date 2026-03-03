/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brandBlue: '#0B4FAF',
        brandRed: '#D62828',
        brandLight: '#F4F8FF',
      },
      boxShadow: {
        dairy: '0 10px 30px rgba(11, 79, 175, 0.12)',
      },
    },
  },
  plugins: [],
}
