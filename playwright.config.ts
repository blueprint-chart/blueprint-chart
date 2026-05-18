import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  // Fail CI if a `.only` was committed by mistake.
  forbidOnly: !!process.env.CI,
  // Bail out of CI early on cascading failures instead of burning the full budget.
  maxFailures: process.env.CI ? 10 : undefined,
  // In CI: never spawn the html report server (it can keep the job alive past test completion).
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : 'list',
  use: {
    baseURL: 'http://localhost:5555',
    headless: true,
  },
  webServer: {
    command: 'pnpm --filter @blueprint-chart/editor dev',
    url: 'http://localhost:5555',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Give the dev server a chance to shut down, then SIGKILL the process group.
    // Without this, Playwright SIGKILLs immediately; with it, child processes can clean up.
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
  },
})
