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
      'blue': '#0081E3'
    },
    fontFamily: {
      'headlines': ["Encode Sans", "sans-serif"],
      'body': ["Open Sans", "sans-serif"],
    },
    extend: {
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

