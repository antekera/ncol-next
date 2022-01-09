const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './src/components/**/*.{js,jsx,ts}',
    './src/pages/**/*.{js,jsx,ts}',
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      primary: colors.blue,
      secondary: colors.orange,
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      emerald: colors.emerald,
      indigo: colors.indigo,
      yellow: colors.yellow,
    },
    textColor: {
      primary: colors.blue,
      secondary: colors.orange,
    },
    fontFamily: {
      sans: ['Lato', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.container': {
          width: '100%',
          maxWidth: '1220px',
        },
      })
    },
  ],
}
