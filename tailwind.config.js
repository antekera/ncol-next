const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/pages/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1122px'
    },
    colors: {
      black: colors.black,
      current: 'currentColor',
      darkBlue: '#102039',
      gray: colors.gray,
      inherit: 'inherit',
      neutral: colors.neutral,
      primary: '#1B75BB',
      red: colors.red,
      secondary: '#fc8c29',
      slate: colors.slate,
      transparent: 'transparent',
      white: colors.white,
      zinc: colors.zinc
    },
    fontFamily: {
      sans: ['Product Sans Regular', 'Arial', 'sans-serif'],
      sans_bold: ['Product Sans Bold', 'Arial', 'sans-serif'],
      sans_italic: ['Product Sans Italic', 'Arial', 'sans-serif'],
      sans_light: ['Product Sans Light Regular', 'Arial', 'sans-serif'],
      sans_medium: ['Product Sans Medium Regular', 'Arial', 'sans-serif'],
      serif: ['Martel Regular', 'Georgia', 'Cambria', 'Times', 'serif'],
      serif_bold: ['Martel Bold', 'Georgia', 'Cambria', 'Times', 'serif'],
      serif_black: ['Martel ExtraBold', 'Georgia', 'Cambria', 'Times', 'serif']
    },
    aspectRatio: {
      auto: 'auto',
      square: '1 / 1',
      video: '16 / 9'
    },
    borderColor: ({ theme }) => ({
      ...theme('colors')
    }),
    boxShadow: {
      menu: 'inset -7px 0 9px -7px rgba(0,0,0,0.3)',
      none: 'none'
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
    function ({ addComponents }) {
      addComponents({
        '.container': {
          width: '100%',
          maxWidth: '1220px'
        }
      })
    }
  ],
  variants: {
    scrollbar: ['dark']
  }
}
