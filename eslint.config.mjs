import nextPlugin from '@next/eslint-plugin-next'
import { FlatCompat } from '@eslint/eslintrc'
import importPlugin from 'eslint-plugin-import'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'

const toArray = (cfg) => (Array.isArray(cfg) ? cfg : [cfg])
const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

const tsTypeChecked = toArray(tseslint.configs.recommendedTypeChecked).map((cfg) => ({
  ...cfg,
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    ...(cfg.languageOptions || {}),
    parserOptions: {
      ...(cfg.languageOptions?.parserOptions || {}),
      project: ['./tsconfig.json'],
      tsconfigRootDir: import.meta.dirname
    }
  }
}))

export default [
  // Ignore build outputs and vendor dirs
  {
    ignores: [
      '.next/**',
      '.open-next/**',
      'node_modules/**',
      'coverage/**',
      'public/**',
      'dist/**',
      'build/**',
      '.sst/**',
      'sst*.{ts,d.ts}',
      'typings/**/*.d.ts',
      'e2e/**',
      'jest.config.ts',
      'jest.setup.ts',
      'knip.ts',
      'middleware.ts'
    ]
  },
  // Next.js + React best practices
  ...toArray(nextPlugin.configs['core-web-vitals']),

  // TypeScript rules (type-aware) only on app source
  ...tsTypeChecked.map((cfg) => ({
    ...cfg,
    files: ['src/**/*.{ts,tsx}']
  })),

  // Legacy-style presets via compat (avoids parserOptions warnings)
  ...compat.extends(
    'plugin:jsx-a11y/recommended',
    'plugin:storybook/recommended',
    'plugin:tailwind/recommended',
    'plugin:sonarjs/recommended-legacy',
    'plugin:security/recommended-legacy'
  ),

  // Prettier disables formatting-related rules
  prettier,

  // Project-specific rules and settings
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      import: importPlugin,
      'react-hooks': reactHooks
    },
    // No global parserOptions.project to avoid parse errors on non-project files
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'tailwind/class-order': 'off',
      'sonarjs/no-all-duplicated-branches': 'off',
      'sonarjs/todo-tag': 'off',
      'sonarjs/different-types-comparison': 'off',
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: true }
      ],
      'no-console': 'error'
    }
  },
  // Relax rules for tests
  {
    files: ['**/__tests__/**/*.{ts,tsx,js,jsx}', '**/*.test.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/require-await': 'off'
    }
  },
  // React components ergonomics
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'sonarjs/prefer-read-only-props': 'off',
      'sonarjs/function-return-type': 'off'
    }
  },
  // Next route/generator files may be async without await
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/require-await': 'off'
    }
  }
]
