import { test, expect } from '@playwright/test'
import { urlSafeB64Encode } from './support/bpc64'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const STOCK_SAMPLE = readFileSync(
  resolve(__dirname, '../packages/lib/src/samples/stock-price-area.bpc'),
  'utf-8',
)

test.describe('/#/copy?bpc64= deep-link', () => {
  test('decodes a BPC payload, hydrates a session, and lands on /edit/<id>/visualize', async ({ page }) => {
    const encoded = urlSafeB64Encode(STOCK_SAMPLE)
    await page.goto(`/#/copy?bpc64=${encoded}`)

    // URL should settle on /#/edit/<sessionId>/visualize.
    await page.waitForURL(/#\/edit\/[a-zA-Z0-9]{11}\/visualize$/)
    expect(page.url()).toMatch(/#\/edit\/[a-zA-Z0-9]{11}\/visualize$/)

    // The hydrated chart's title should be rendered.
    await expect(page.locator('text=The US national debt has more than tripled since 2008').first()).toBeVisible()
  })

  test('redirects to homepage when the bpc64 query param is missing', async ({ page }) => {
    await page.goto('/#/copy')
    await page.waitForURL(/#\/$/)
    await expect(page.locator('.landing-hero__inner__text__h1')).toBeVisible()
  })

  test('redirects to homepage when payload is not valid base64', async ({ page }) => {
    // `!@` are outside the base64 alphabet (even after url-safe substitution).
    await page.goto('/#/copy?bpc64=not!base64@@')
    await page.waitForURL(/#\/$/)
    await expect(page.locator('.landing-hero__inner__text__h1')).toBeVisible()
  })

  test('redirects to homepage when decoded payload is not valid BPC', async ({ page }) => {
    const encoded = urlSafeB64Encode('this is definitely not a chart definition')
    await page.goto(`/#/copy?bpc64=${encoded}`)
    await page.waitForURL(/#\/$/)
    await expect(page.locator('.landing-hero__inner__text__h1')).toBeVisible()
  })
})
