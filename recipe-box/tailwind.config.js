/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FAF7F2', dark: '#F5F0E8' },
        terracotta: { DEFAULT: '#C4622D', light: '#D4845A', dark: '#A3501F' },
        sage: { DEFAULT: '#7A9E7E', light: '#9AB89E', dark: '#5C8060' },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

