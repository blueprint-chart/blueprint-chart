import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * URL-safe base64 encode a UTF-8 string, mirroring `urlSafeB64Encode` in the
 * docs package: standard base64, then `+` -> `-`, `/` -> `_`, strip `=` padding.
 */
function urlSafeB64Encode(input: string): string {
  const b64 = Buffer.from(input, 'utf-8').toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const BITCOIN_SAMPLE = readFileSync(
  resolve(__dirname, '../packages/lib/src/samples/bitcoin-price.bpc'),
  'utf-8',
)

test.describe('/#/copy/:base64 deep-link', () => {
  test('decodes a BPC payload, hydrates a session, and lands on /edit/<id>/visualize', async ({ page }) => {
    const encoded = urlSafeB64Encode(BITCOIN_SAMPLE)
    await page.goto(`/#/copy/${encoded}`)

    // URL should settle on /#/edit/<sessionId>/visualize.
    await page.waitForURL(/#\/edit\/[a-zA-Z0-9]{11}\/visualize$/)
    expect(page.url()).toMatch(/#\/edit\/[a-zA-Z0-9]{11}\/visualize$/)

    // The hydrated chart's title should be rendered.
    await expect(page.locator('text=Bitcoin surged past $90,000 in 2024').first()).toBeVisible()
  })

  test('redirects to homepage when payload is not valid base64', async ({ page }) => {
    // `!@` are outside the base64 alphabet (even after url-safe substitution)
    // and survive the hash-route param without being treated as querystring.
    await page.goto('/#/copy/not!base64@@')
    await page.waitForURL(/#\/$/)
    await expect(page.locator('.landing-hero__inner__text__h1')).toBeVisible()
  })

  test('redirects to homepage when decoded payload is not valid BPC', async ({ page }) => {
    const encoded = urlSafeB64Encode('this is definitely not a chart definition')
    await page.goto(`/#/copy/${encoded}`)
    await page.waitForURL(/#\/$/)
    await expect(page.locator('.landing-hero__inner__text__h1')).toBeVisible()
  })
})
