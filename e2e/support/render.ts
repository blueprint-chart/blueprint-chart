import type { Page } from '@playwright/test'

/**
 * Navigate to the `/#/render` route with a BPC payload.
 *
 * The base64 must be URL-encoded: an unencoded `+` decodes back to a space,
 * `atob` throws, and the page shows "No data to preview" as though the chart
 * itself were broken.
 */
export async function gotoRender(page: Page, bpc: string) {
  const payload = encodeURIComponent(Buffer.from(bpc, 'utf-8').toString('base64'))
  await page.goto(`/#/render?bpc64=${payload}`)
  await page.waitForSelector('.bc-frame', { timeout: 10_000 })
}
