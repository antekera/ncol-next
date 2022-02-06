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
      sans: ['Product Sans Regular', 'Arial', 'sans-serif'],
      sans_black: ['Product Sans Black Regular', 'Arial', 'sans-serif'],
      sans_blackItalic: ['Product Sans Black Italic', 'Arial', 'sans-serif'],
      sans_bold: ['Product Sans Bold', 'Arial', 'sans-serif'],
      sans_boldItalic: ['Product Sans Bold Italic', 'Arial', 'sans-serif'],
      sans_italic: ['Product Sans Italic', 'Arial', 'sans-serif'],
      sans_light: ['Product Sans Light Regular', 'Arial', 'sans-serif'],
      sans_lightItalic: ['Product Sans Light Italic', 'Arial', 'sans-serif'],
      sans_medium: ['Product Sans Medium Regular', 'Arial', 'sans-serif'],
      sans_mediumItalic: ['Product Sans Medium Italic', 'Arial', 'sans-serif'],
      sans_thin: ['Product Sans Thin Regular', 'Arial', 'sans-serif'],
      sans_thinItalic: ['Product Sans Thin Italic', 'Arial', 'sans-serif'],
      serif: ['Martel Regular', 'Georgia', 'Cambria', 'Times', 'serif'],
      serif_bold: ['Martel Bold', 'Georgia', 'Cambria', 'Times', 'serif'],
      serif_black: ['Martel ExtraBold', 'Georgia', 'Cambria', 'Times', 'serif'],
      serif_heavy: ['Martel Heavy', 'Georgia', 'Cambria', 'Times', 'serif'],
      serif_light: ['Martel Light', 'Georgia', 'Cambria', 'Times', 'serif'],
      serif_ultraLight: [
        'Martel UltraLight',
        'Georgia',
        'Cambria',
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
