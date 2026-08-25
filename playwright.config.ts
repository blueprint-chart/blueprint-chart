import { defineConfig } from '@playwright/test'

// Overridable so several worktrees can run e2e side by side without fighting
// over a single port. Kept in sync with the editor's own vite server default.
const port = Number(process.env.PORT ?? 5555)

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
    baseURL: `http://localhost:${port}`,
    headless: true,
  },
  webServer: {
    command: 'pnpm --filter @blueprint-chart/editor dev',
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Give the dev server a chance to shut down, then SIGKILL the process group.
    // Without this, Playwright SIGKILLs immediately; with it, child processes can clean up.
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
  },
})
