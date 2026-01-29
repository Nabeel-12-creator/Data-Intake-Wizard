/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#002bff',
        navy: '#0B1157',
        'brand-red': '#D0000D',
        'brand-green': '#008D28',
      },
      fontFamily: {
        heading: ['Caladea', 'serif'],
        body: ['Nunito Sans', 'sans-serif'],
      },
      borderRadius: {
        'button': '9999px',
      },
    },
  },
  plugins: [],
};
