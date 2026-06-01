import { test, expect } from '@playwright/test'

// With no VITE_SUPABASE_* env and no config.json deployed, accounts must be OFF.
// Accounts-ENABLED flows (magic-link auth, render-by-id) require a live Supabase
// project + email round-trip, so they are intentionally NOT part of CI.
test.describe('accounts disabled (default build)', () => {
  test('shows no Sign in control on the dashboard', async ({ page }) => {
    await page.goto('/#/charts')
    await expect(page.getByRole('button', { name: 'Sign in' })).toHaveCount(0)
  })

  test('base64 render route still works', async ({ page }) => {
    // Use a known-valid chart type (bar-vertical).  'chart bar' is not a
    // recognised type in this codebase and would silently produce no output.
    const bpc64 = Buffer.from('chart bar-vertical {\n  data {\n    A = 1\n  }\n}\n').toString('base64')
    await page.goto(`/#/render?bpc64=${encodeURIComponent(bpc64)}`)
    // .render-page__card is the container — present in the DOM immediately but
    // the chart SVG is injected asynchronously via renderChart().  Wait for the
    // inner .bc-frame (the same anchor used by chart-rendering.spec.ts) and then
    // confirm the root container is also attached, proving the render page mounted.
    await page.waitForSelector('.bc-frame', { timeout: 10_000 })
    await expect(page.locator('.render-page__card')).toBeAttached()
  })
})
