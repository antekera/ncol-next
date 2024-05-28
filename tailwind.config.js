const colors = require('tailwindcss/colors')
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/app/**/*.{js,jsx,ts,tsx}'
  ],
  prefix: '',
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
      green: colors.green,
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
      sans: ['Product Sans', 'sans-serif'],
      sans_light: ['Product Sans Light', 'sans-serif'],
      sans_medium: ['Product Sans Medium', 'sans-serif'],
      sans_bold: ['Product Sans Black', 'sans-serif']
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
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
    function ({ addComponents }) {
      addComponents({
        '.container': {
          width: '100%',
          maxWidth: '1220px'
        }
      })
    }
  ],
  extend: {
    keyframes: {
      'accordion-down': {
        from: { height: '0' },
        to: { height: 'var(--radix-accordion-content-height)' }
      },
      'accordion-up': {
        from: { height: 'var(--radix-accordion-content-height)' },
        to: { height: '0' }
      }
    },
    animation: {
      'accordion-down': 'accordion-down 0.2s ease-out',
      'accordion-up': 'accordion-up 0.2s ease-out'
    }
  },
  variants: {
    scrollbar: ['dark']
  }
}
