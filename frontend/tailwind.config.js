/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#4fd1a5',
        'brand-strong': '#2bbf8d',
        accent: '#f5b84b',
        danger: '#ef6b73',
      },
    },
  },
  plugins: [],
};
