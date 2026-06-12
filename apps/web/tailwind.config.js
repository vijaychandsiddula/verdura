/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './store/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        green: { 50:'#eaf3de', 100:'#ddeeba', 200:'#c0dd97', 400:'#97c459', 600:'#639922', 700:'#3b6d11', 800:'#27500a', 900:'#173404', 950:'#0f1f06' },
        sand: { DEFAULT:'#f5f0e8', dark:'#e8e0d0' },
        ink: { DEFAULT:'#1a1a18' },
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
