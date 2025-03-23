import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname
})

const eslintConfig = [
  ...compat.config({
    extends: [
      'next',
      'next/core-web-vitals',
      'next/typescript',
      'plugin:jsx-a11y/recommended',
      'plugin:storybook/recommended',
      'plugin:tailwind/recommended',
      'plugin:sonarjs/recommended-legacy',
      'plugin:security/recommended-legacy',
      'prettier'
    ],
    rules: {
      'tailwind/class-order': 'off',
      'sonarjs/no-all-duplicated-branches': 'off',
      'sonarjs/todo-tag': 'off',
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true
        }
      ],
      'no-console': 'error'
    }
  })
]

export default eslintConfig
