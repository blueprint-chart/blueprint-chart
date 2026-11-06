import { test, expect } from '@playwright/test'

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
