/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          'primary': '#36393F',
          'secondary': '#2F3136',
          'accent': '#5865F2',
          'text-light': '#FFFFFF',
          'text-gray': '#B9BBBE',
          'success': '#43B581',
          'warning': '#FAA61A',
          'error': '#F04747',
        }
      }
    },
  },
  plugins: [],
}
