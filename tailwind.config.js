/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f4f7f5',
          100: '#e1e8e3',
          200: '#c3d1c7',
          300: '#9fb5a6',
          400: '#7a9787',
          500: '#5f7c6d',
          600: '#4a6357',
          700: '#3b4f46',
          800: '#2a3a34',
          900: '#1b2722',
        },
        tide: {
          50: '#eaf7f2',
          100: '#cfeadf',
          200: '#9fd4c0',
          300: '#6ab99b',
          400: '#3ea884',
          500: '#2e8f70',
          600: '#2f6a56',
          700: '#275446',
          800: '#1e4136',
          900: '#153028',
        },
        spice: {
          50: '#fff4e6',
          100: '#ffe1bf',
          200: '#ffc17a',
          300: '#ffa348',
          400: '#ff7f1f',
          500: '#e06114',
          600: '#b05413',
          700: '#8c4214',
          800: '#6f3514',
          900: '#5a2c13',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 30px 80px -50px rgba(78, 160, 130, 0.7)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
