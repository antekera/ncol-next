module.exports = {
  content: [
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/pages/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: false,
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    colors: ({ colors }) => ({
      inherit: colors.inherit,
      current: colors.current,
      transparent: colors.transparent,
      black: colors.black,
      white: colors.white,
      orange: colors.orange,
      slate: colors.slate,
      gray: colors.gray,
      zinc: colors.zinc,
    }),
    textColor: ({ theme }) => theme('colors'),
    fontFamily: {
      sans: [
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        '"Noto Sans"',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
      serif: [
        'ui-serif',
        'Georgia',
        'Cambria',
        '"Times New Roman"',
        'Times',
        'serif',
      ],
    },
    aspectRatio: {
      auto: 'auto',
      square: '1 / 1',
      video: '16 / 9',
    },
    borderColor: ({ theme }) => ({
      ...theme('colors'),
      DEFAULT: theme('colors.gray.200', 'currentColor'),
    }),
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
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
