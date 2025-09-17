import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 120_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'pnpm dev --port 3000',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'test',
      NUXT_TELEMETRY_DISABLED: '1',
      DATABASE_URL: 'file:./prisma/test.db',
      GITHUB_TOKEN: 'mock',
      OPENAI_API_KEY: ''
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
