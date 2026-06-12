/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        green: {
          50:  '#eaf3de',
          100: '#ddeeba',
          200: '#c0dd97',
          400: '#97c459',
          600: '#639922',
          700: '#3b6d11',
          800: '#27500a',
          900: '#173404',
          950: '#0f1f06',
        },
        sand: {
          DEFAULT: '#f5f0e8',
          dark:    '#e8e0d0',
          darker:  '#dbd3c4',
        },
        soil: '#5c4a2a',
        sage: '#8fa67c',
      },
      fontFamily: {
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['DM Serif Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.4,0,0.2,1)',
        'slide-in':   'slideIn 0.35s cubic-bezier(0.4,0,0.2,1)',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                        to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(16px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideIn: { from: { transform: 'translateX(100%)' },       to: { transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
