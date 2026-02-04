import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './'
})

const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/.storybook/',
    '<rootDir>/e2e/',
    'styles.ts$',
    '<rootDir>/src/lib/httpClient.ts$',
    '<rootDir>/src/lib/hooks(/.*)?$',
    '<rootDir>/src/lib/hooks/data(/.*)?$',
    '<rootDir>/src/components/ui/alert-dialog.tsx$',
    '<rootDir>/src/app/actions/subscribe.ts$',
    '<rootDir>/src/components/Header(/.*)?$',
    '<rootDir>/src/components/SideNav(/.*)?$',
    '<rootDir>/src/components/ProgressBar/index.tsx$',
    '<rootDir>/src/lib/context/StateContext.tsx$',
    'StateContext.tsx$',
    '<rootDir>/src/components/CoverImage/index.tsx$',
    '<rootDir>/src/components/ContactForm/index.tsx$',
    '<rootDir>/src/components/PostBody/index.tsx$',
    '<rootDir>/src/components/AdSenseBanner/AdClient.tsx$',
    '<rootDir>/src/components/LoaderSinglePosts/index.tsx$',
    '<rootDir>/src/components/SocialLinks/index.tsx$',
    '<rootDir>/src/components/ui/button.tsx$',
    '<rootDir>/src/components/FacebookDialog/index.tsx$',
    // Ignore coverage for the dynamic single post page
    '<rootDir>/src/app/\\[posts\\]/\\[month\\]/\\[day\\]/\\[slug\\]/page.tsx$',
    'query.ts$',
    '<rootDir>/src/app/\\(centered\\)(/.*)?$',
    '<rootDir>/src/app/\\(sidebar\\)/horoscopo(/.*)?$',
    '<rootDir>/src/app/api/horoscopo(/.*)?$',
    '<rootDir>/src/components/HoroscopoShareImage(/.*)?$',
    '<rootDir>/src/lib/horoscopo.ts$',
    '<rootDir>/src/lib/hooks/data/useHoroscopo.ts$',
    '<rootDir>/src/lib/turso.ts$',
    '<rootDir>/src/lib/utils/utils.ts$'
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 75,
      lines: 80,
      statements: 80
    }
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/',
    '<rootDir>/tests/',
    '<rootDir>/coverage/',
    '<rootDir>/.storybook/'
  ],
  // Match tests in __tests__ folders or files ending with .test/.spec
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx|js)$',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@blocks/(.*)$': '<rootDir>/src/blocks/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@providers/(.*)$': '<rootDir>/src/providers/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/blocks/(.*)$': '<rootDir>/src/blocks/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/providers/(.*)$': '<rootDir>/src/providers/$1',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$'
  ],
  fakeTimers: {
    enableGlobally: true
  }
}

export default createJestConfig(config)
