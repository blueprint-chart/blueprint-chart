import { readFileSync } from 'node:fs'
import { test, expect, type Page } from '@playwright/test'

const PRUSSIAN = 'rgb(37, 99, 160)'
const PRUSSIAN_CHANNELS = '37, 99, 160'
// Vermilion #E4512B (light) / #F2703F (dark) is editorial-only and must never
// land on an interactive control.
const VERMILION_LIGHT = 'rgb(228, 81, 43)'
const VERMILION_DARK = 'rgb(242, 112, 63)'
const VERMILION_LIGHT_CHANNELS = '228, 81, 43'
const VERMILION_DARK_CHANNELS = '242, 112, 63'

const SAMPLE_DSL = readFileSync(new URL('../packages/lib/src/samples/letter-frequency.bpc', import.meta.url), 'utf8')

// The new-chart tile only shows next to saved charts; an empty list gets the empty state instead.
async function saveChart(page: Page) {
  await page.evaluate(dsl => localStorage.setItem('blueprint-chart:e2etileaaa', dsl), SAMPLE_DSL)
  await page.reload()
}

const resolveStyle = (el: Element, [prop, value]: ['color' | 'boxShadow', string]) => {
  const probe = document.createElement('div')
  probe.style[prop] = value
  el.parentElement!.appendChild(probe)
  const resolved = getComputedStyle(probe)[prop]
  probe.remove()
  return resolved
}

test.describe('app shell (dashboard)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/charts')
  })

  test('primary "New chart" CTA is the strong emphasis color, never vermilion', async ({ page }) => {
    const cta = page.locator('.button-icon', { hasText: 'New chart' }).first()
    await expect(cta).toBeVisible()
    const bg = await cta.evaluate(el => getComputedStyle(el).backgroundColor)
    expect(bg).toBe(await cta.evaluate(resolveStyle, ['color', 'var(--bs-emphasis-color)']))
    expect(bg).not.toBe(PRUSSIAN)
    expect(bg).not.toBe(VERMILION_LIGHT)
    expect(bg).not.toBe(VERMILION_DARK)
  })

  test('focus ring on the new-chart tile uses the focus ring token, never vermilion', async ({ page }) => {
    await saveChart(page)
    const tile = page.locator('.dashboard-new-card').first()
    await expect(tile).toBeVisible()
    await tile.focus()
    const shadow = await tile.evaluate(el => getComputedStyle(el).boxShadow)
    expect(shadow).toBe(await tile.evaluate(resolveStyle, ['boxShadow', 'var(--bc-focus-ring)']))
    expect(shadow).not.toContain(PRUSSIAN_CHANNELS)
    expect(shadow).not.toContain(VERMILION_LIGHT_CHANNELS)
    expect(shadow).not.toContain(VERMILION_DARK_CHANNELS)
  })

  test('the new-chart tile has no ambient drop shadow (flat shell)', async ({ page }) => {
    await saveChart(page)
    const tile = page.locator('.dashboard-new-card').first()
    await expect(tile).toBeVisible()
    const shadow = await tile.evaluate(el => getComputedStyle(el).boxShadow)
    expect(shadow).toBe('none')
  })

  test('dark theme flips the CTA to the dark emphasis color, never vermilion', async ({ page }) => {
    const cta = page.locator('.button-icon', { hasText: 'New chart' }).first()
    await expect(cta).toBeVisible()

    await page.evaluate(() => document.documentElement.setAttribute('data-bs-theme', 'dark'))
    // Guard against a silently-failed toggle giving a false pass on the
    // pre-toggle Prussian value. Confirm the flip actually took effect first.
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-bs-theme'))).toBe('dark')

    await expect.poll(async () => {
      const bg = await cta.evaluate(el => getComputedStyle(el).backgroundColor)
      return bg === await cta.evaluate(resolveStyle, ['color', 'var(--bs-emphasis-color)'])
    }).toBe(true)
    const bg = await cta.evaluate(el => getComputedStyle(el).backgroundColor)
    expect(bg).not.toBe(PRUSSIAN)
    expect(bg).not.toBe(VERMILION_LIGHT)
    expect(bg).not.toBe(VERMILION_DARK)
  })
})
