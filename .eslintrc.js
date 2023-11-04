// .eslintrc.js
module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 8
  },
  // to enable features such as async/await
  extends: [
    'eslint:recommended',
    'next',
    'next/core-web-vitals',
    'plugin:jsx-a11y/recommended',
    'plugin:storybook/recommended',
    'plugin:tailwind/recommended',
    'plugin:sonarjs/recommended',
    'plugin:security/recommended',
    'prettier'
  ],
  overrides: [
    // Configuration for TypeScript files
    {
      files: ['**/*.ts', '**/*.tsx'],
      plugins: [
        '@typescript-eslint',
        'sonarjs',
        'unused-imports',
      ],
      extends: [
        'airbnb-typescript',
        'next/core-web-vitals',
        'plugin:prettier/recommended'
      ],
      parserOptions: {
        project: './tsconfig.json'
      },
      rules: {
        'react-hooks/exhaustive-deps': 'off',
        'security/detect-object-injection': 'off',
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: true
          }
        ],
        'prettier/prettier': [
          'error',
          {
            singleQuote: true
          }
        ],
        'no-console': 'error',
        'react/destructuring-assignment': 'off',
        // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
        'jsx-a11y/anchor-is-valid': 'off',
        // Next.js use his own internal link system
        'react/require-default-props': 'off',
        // Allow non-defined react props as undefined
        'react/jsx-props-no-spreading': 'off',
        // _app.tsx uses spread operator and also, react-hook-form
        '@next/next/no-img-element': 'off',
        // We currently not using next/image because it isn't supported with SSG mode
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal'],
            pathGroups: [
              {
                pattern: 'react',
                group: 'external',
                position: 'before'
              }
            ],
            pathGroupsExcludedImportTypes: ['react'],
            'newlines-between': 'always',
            alphabetize: {
              order: 'asc',
              caseInsensitive: true
            }
          }
        ],
        'import/prefer-default-export': 'off',
        // Named export is easier to refactor automatically
        'class-methods-use-this': 'off',
        // _document.tsx use render method without `this` keyword
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_'
          }
        ]
      }
    }
  ]
}
