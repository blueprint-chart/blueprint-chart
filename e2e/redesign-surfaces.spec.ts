import { test, expect, type Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DSL = fs.readFileSync(path.resolve(__dirname, '../packages/lib/src/samples/farm-compass.bpc'), 'utf-8')
const CHART_ID = 'test-redesign-surfaces'

const resolveVar = (page: Page, name: string, prop: 'color' | 'backgroundColor' = 'color') =>
  page.evaluate(([n, p]) => {
    const probe = document.createElement('i')
    probe.style[p as 'color'] = `var(${n})`
    document.body.append(probe)
    const value = getComputedStyle(probe)[p as 'color']
    probe.remove()
    return value
  }, [name, prop] as const)

const style = (page: Page, selector: string, prop: string) =>
  page.locator(selector).first().evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop)

async function open(page: Page, hash: string, theme: string) {
  await page.addInitScript(({ id, dsl, t }) => {
    localStorage.setItem('bc-theme', JSON.stringify({ theme: t }))
    localStorage.setItem(`blueprint-chart:${id}`, dsl)
    localStorage.setItem(`blueprint-chart:${id}:meta`, JSON.stringify({ savedAt: new Date().toISOString() }))
  }, { id: CHART_ID, dsl: DSL, t: theme })
  await page.goto(`/#${hash}`)
  await expect(page.locator('html')).toHaveAttribute('data-bs-theme', theme)
}

for (const theme of ['light', 'dark']) {
  test.describe(`redesign surfaces (${theme})`, () => {
    test('/charts regions', async ({ page }) => {
      await open(page, '/charts', theme)
      await expect(page.locator('.layout-shell__main')).toBeVisible()
      expect(await style(page, '.layout-shell__main', 'background-color')).toBe(await style(page, 'body', 'background-color'))
      expect(await style(page, '.layout-shell__sidebar', 'border-right-width')).toBe('1px')
      expect(await style(page, '.layout-shell__sidebar', 'border-right-color')).toBe(await resolveVar(page, '--bs-border-color'))
    })

    test('visualize regions', async ({ page }) => {
      await open(page, `/edit/${CHART_ID}/visualize`, theme)
      await expect(page.locator('.bc-frame-body svg')).toBeVisible()
      expect(await style(page, '.layout-shell__main', 'background-color')).toBe(await style(page, 'body', 'background-color'))
      expect(await style(page, '.layout-shell__sidebar', 'border-right-width')).toBe('1px')
      expect(await style(page, '.layout-shell__sidebar', 'border-right-color')).toBe(await resolveVar(page, '--bs-border-color'))

      const emphasis = await resolveVar(page, '--bs-emphasis-color')
      const tab = page.locator('.navigation-stepper-tabs__step--current').first()
      await expect(tab).toBeVisible()
      expect(await tab.evaluate(el => getComputedStyle(el).borderBottomColor)).toBe(emphasis)

      const rail = page.locator('.navigation-icon-rail__button').first()
      await rail.click()
      const active = page.locator('.navigation-icon-rail__button--active').first()
      await expect(active).toBeVisible()
      expect(await active.evaluate(el => getComputedStyle(el).backgroundColor)).toBe(await resolveVar(page, '--bs-tertiary-bg'))

      const timeline = page.locator('.scene-timeline--floating').first()
      await expect(timeline).toBeVisible()
      expect(await timeline.evaluate(el => getComputedStyle(el).borderTopWidth)).toBe('1px')
      expect(await timeline.evaluate(el => getComputedStyle(el).borderRadius)).toBe('0px')
      expect(await timeline.evaluate(el => getComputedStyle(el).boxShadow)).toBe('none')
    })
  })
}
