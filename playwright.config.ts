import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'
const IS_LOCAL = /localhost|127\.0\.0\.1/i.test(BASE_URL)
const USE_STANDALONE = process.env.USE_STANDALONE === 'true'

export default defineConfig({
  // Your E2E tests live under the `e2e/` folder
  testDir: 'e2e',
  globalSetup: './e2e/global-setup.ts',
  testMatch: [
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/*.spec.tsx',
    '**/*.test.tsx'
  ],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 1,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        userAgent: `${devices['Desktop Chrome'].userAgent} Playwright`
      }
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        userAgent: `${devices['Desktop Firefox'].userAgent} Playwright`
      }
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        userAgent: `${devices['Desktop Safari'].userAgent} Playwright`
      }
    }
  ]
  ,
  // Start Next.js locally if targeting a localhost base URL
  webServer: IS_LOCAL
    ? {
      command: USE_STANDALONE
        ? 'npm run build && node .next/standalone/server.js'
        : 'npm run build && npm run start',
      url: BASE_URL,
      reuseExistingServer: true,
      timeout: 180_000
    }
    : undefined
})
