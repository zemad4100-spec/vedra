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
          dark: '#08160e',       // غامق جداً (زي القديم)
          main: '#153826',       // الأخضر الأساسي القديم
          light: '#358a57',      // الأخضر الفاتح القديم
          cream: '#fbfaf7',      // البيج الفاتح
          sand: '#e6dccb',       // البيج الغامق
          
          // ✅ الألوان الجديدة اللي في تصميم لوحة التحكم
          'dashboard-dark': '#0a2e1f', // لون الـ Sidebar الغامق
          'dashboard-main': '#15803d', // لون الأزرار والكروت الرئيسي
          'dashboard-light': '#4ade80', // لون النصوص الفاتحة والنجاح
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