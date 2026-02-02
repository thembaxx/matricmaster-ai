/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#18181b',
        'accent-blue': '#3b82f6',
        'accent-yellow': '#fbbf24',
        'accent-purple': '#a855f7',
        'accent-green': '#22c55e',
        'background-light': '#f4f4f5',
        'background-dark': '#09090b',
      },
      fontFamily: {
        display: ['Lexend', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
