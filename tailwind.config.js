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
      xl: '1122px',
    },
    colors: {
      baseGray: '#2c2c2e',
      black: '#000000',
      current: 'current',
      darkBlue: '#102039',
      darkGray: '#1f2830',
      gray: '#A5A8AB',
      inherit: 'inherit',
      lightBlue: '#0463C21F',
      lightGray: '#e7ebf0',
      primary: '#1B75BB',
      secondary: '#fc8c29',
      transparent: 'transparent',
      white: '#ffffff',
    },
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
    boxShadow: {
      menu: 'inset -7px 0 9px -7px rgba(0,0,0,0.3)',
      none: 'none',
    },
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
          maxWidth: '1220px',
        },
      })
    },
  ],
  variants: {
    scrollbar: ['dark'],
  },
}
