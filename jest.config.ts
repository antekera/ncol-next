import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
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
    '<rootDir>/tests/',
    '<rootDir>/coverage/',
    '<rootDir>/.storybook/'
  ],
  testRegex: '(/__test__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$': `<rootDir>/__mocks__/fileMock.js`,
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css|sass|scss)$']
}

export default config
