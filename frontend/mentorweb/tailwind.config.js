/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    "./src/**/*.{html,js,jsx}",
  ],
  theme: {
    colors: {
      'purple': '#4b2e83',
      'gold': '#b7a57a',
      'metallic-gold': '#85754d',
      'white': '#ffffff',
      'black': '#000000',
      'gray': '#D9D9D9',
      'light-gray': '#a8a29e',
      'dark-gray': '#4f4f4f',
      'popup-gray': '#f0f0f0',
      'calendar-popup-gray': '#f5f5f5',
      'blue': '#0081E3',
      'green': '#39ff14',
    },
    fontFamily: {
      'headlines': ["Encode Sans", "sans-serif"],
      'body': ["Open Sans", "sans-serif"],
    },
    extend: {
      keyframes: {
        blink: {
          '50%': { 'border-color': '#39ff14' },
        },
      },
      animation: {
        blink: 'blink 1.5s infinite',
      },
      width: {
        '14%': '14%',
        '12%': '12%',
        '8%': '8%',
        '6%': '6%',
      },
    },
  },
  plugins: [],
}

