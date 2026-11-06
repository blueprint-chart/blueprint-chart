import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gotoRender } from './support/render'

const SAMPLE = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), '../packages/lib/src/samples/life-expectancy-wealth.bpc'),
  'utf-8',
)

const TSV = [
  'Country\tGDP per capita\tLife expectancy\tPopulation\tContinent',
  'France\t53449\t82.8\t67.4\tEurope',
  'Germany\t62950\t81.3\t83.1\tEurope',
  'Spain\t46896\t83.8\t47.1\tEurope',
  'Nigeria\t5424\t45.7\t97.1\tAfrica',
  'Ethiopia\t2438\t65.7\t115.7\tAfrica',
  'Rwanda\t1166\t47.8\t7.4\tAfrica',
  'Brazil\t18019\t75.8\t207.5\tAmericas',
  'Chile\t28228\t80.3\t19.2\tAmericas',
].join('\n')

const points = '.bc-frame-body circle.bc-scatter-point'

test.describe('scatter authoring', () => {
  test('pasted data becomes a scatter the column and trend settings drive', async ({ page }) => {
    await page.goto('/#/new')
    await page.locator('textarea').fill(TSV)
    await page.locator('button', { hasText: 'Load data' }).click()
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    await page.locator('[aria-label="Chart Type"]').click()
    await page.locator('.form-control-dropdown__toggle .dropdown-toggle').click()
    await page.locator('.form-control-dropdown-item__content__text__label', { hasText: 'Scatter' }).first().click()

    await expect(page.locator(points)).toHaveCount(8)
    const legend = page.locator('.bc-frame .bc-legend')
    for (const continent of ['Europe', 'Africa', 'Americas']) {
      await expect(legend).toContainText(continent)
    }

    await page.locator('[aria-label="Style"]').click()
    const firstPoint = page.locator(`${points}[data-key="France"]`)
    const cxBefore = await firstPoint.getAttribute('cx')
    await page.locator('#scatter-x').selectOption({ label: 'Life expectancy' })
    await expect.poll(() => firstPoint.getAttribute('cx')).not.toBe(cxBefore)

    await page.locator('#scatter-trend').selectOption({ label: 'Overall' })
    await expect(page.locator('.bc-frame-body path.bc-trend-line')).toHaveCount(1)
  })
})

test.describe('scatter scenes', () => {
  test('points glide to their new position when the scene title changes length', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await gotoRender(page, SAMPLE)
    const next = page.locator('.bc-frame [aria-label="Next scene"]')
    await next.click()
    await expect(page.locator('.bc-frame')).toContainText('Richer countries live longer')
    await page.waitForTimeout(1500)

    await page.evaluate(() => {
      const w = window as unknown as { cxTrace: string[] }
      w.cxTrace = []
      const start = performance.now()
      const tick = () => {
        w.cxTrace.push(document.querySelector('circle.bc-scatter-point[data-key="China"]')?.getAttribute('cx') ?? '')
        if (performance.now() - start < 1000) {
          requestAnimationFrame(tick)
        }
      }
      requestAnimationFrame(tick)
    })
    await next.click()
    await expect(page.locator('.bc-frame')).toContainText('In 1990')
    await expect.poll(() => page.evaluate(() => (window as unknown as { cxTrace: string[] }).cxTrace.length), { timeout: 3000 }).toBeGreaterThan(30)

    const distinct = await page.evaluate(() => new Set((window as unknown as { cxTrace: string[] }).cxTrace).size)
    expect(distinct).toBeGreaterThan(5)
  })
})
