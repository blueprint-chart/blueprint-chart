import { test, expect } from '@playwright/test'

// Prussian #2563A0 is the functional accent (buttons, focus, links).
const PRUSSIAN = 'rgb(37, 99, 160)'
// Same channels, matched loosely so it also hits inside an rgba(...) shadow.
const PRUSSIAN_CHANNELS = '37, 99, 160'
// Vermilion #E4512B (light) / #F2703F (dark) is editorial-only and must never
// land on an interactive control.
const VERMILION_LIGHT = 'rgb(228, 81, 43)'
const VERMILION_DARK = 'rgb(242, 112, 63)'
const VERMILION_LIGHT_CHANNELS = '228, 81, 43'
const VERMILION_DARK_CHANNELS = '242, 112, 63'

test.describe('app shell (dashboard)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/charts')
  })

  test('primary "New chart" CTA is Prussian, never vermilion', async ({ page }) => {
    const cta = page.locator('.button-icon', { hasText: 'New chart' }).first()
    await expect(cta).toBeVisible()
    const bg = await cta.evaluate(el => getComputedStyle(el).backgroundColor)
    expect(bg).toBe(PRUSSIAN)
    expect(bg).not.toBe(VERMILION_LIGHT)
    expect(bg).not.toBe(VERMILION_DARK)
  })

  test('focus ring on the new-chart tile is Prussian, never vermilion', async ({ page }) => {
    const tile = page.locator('.dashboard-new-card').first()
    await expect(tile).toBeVisible()
    await tile.focus()
    const shadow = await tile.evaluate(el => getComputedStyle(el).boxShadow)
    expect(shadow).toContain(PRUSSIAN_CHANNELS)
    expect(shadow).not.toContain(VERMILION_LIGHT_CHANNELS)
    expect(shadow).not.toContain(VERMILION_DARK_CHANNELS)
  })

  test('the new-chart tile has no ambient drop shadow (flat shell)', async ({ page }) => {
    const tile = page.locator('.dashboard-new-card').first()
    await expect(tile).toBeVisible()
    const shadow = await tile.evaluate(el => getComputedStyle(el).boxShadow)
    expect(shadow).toBe('none')
  })

  test('dark theme keeps the CTA Prussian, never vermilion', async ({ page }) => {
    const cta = page.locator('.button-icon', { hasText: 'New chart' }).first()
    await expect(cta).toBeVisible()

    await page.evaluate(() => document.documentElement.setAttribute('data-bs-theme', 'dark'))
    // Guard against a silently-failed toggle giving a false pass on the
    // pre-toggle Prussian value. Confirm the flip actually took effect first.
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-bs-theme'))).toBe('dark')

    const bg = await cta.evaluate(el => getComputedStyle(el).backgroundColor)
    // The functional accent does not shift with theme, so this should hold
    // exactly, not just "not vermilion". The vermilion checks are the
    // load-bearing assertion here (the redesign's core invariant).
    expect(bg).toBe(PRUSSIAN)
    expect(bg).not.toBe(VERMILION_LIGHT)
    expect(bg).not.toBe(VERMILION_DARK)
  })
})
