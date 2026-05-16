import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  use: {
    baseURL: 'http://localhost:5555',
    headless: true,
  },
  webServer: {
    command: 'pnpm --filter @blueprint-chart/editor dev',
    url: 'http://localhost:5555',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
