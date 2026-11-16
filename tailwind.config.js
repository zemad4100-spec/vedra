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
          dark: '#08160e',
          main: '#153826',
          light: '#358a57',
          cream: '#fbfaf7',
          sand: '#e6dccb',
        }
      },
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}