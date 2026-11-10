import { test, expect } from '@playwright/test'

const TSV = [
  'Quarter\tSales\tLow\tHigh',
  'Q1\t29\t25\t32',
  'Q2\t22\t18\t25',
  'Q3\t14\t12\t16',
  'Q4\t10\t8\t12',
].join('\n')

const frame = '.bc-frame-body'

test.describe('overlays authoring', () => {
  test('adds a range overlay to a vertical bar chart and renders it', async ({ page }) => {
    await page.goto('/#/new')
    await page.locator('textarea').fill(TSV)
    await page.locator('button', { hasText: 'Load data' }).click()
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
    await expect(page.locator(`${frame} svg`)).toBeVisible()

    await page.locator('[aria-label="Chart Type"]').click()
    await page.locator('.editor-chart-type-picker button[value="bar-vertical"]').click()

    await page.locator('[aria-label="Annotate"]').click()
    const section = page.locator('.settings-section', { hasText: 'Overlays' })
    await section.getByRole('button', { name: 'Add' }).click()
    await section.getByRole('button', { name: 'Range' }).click()

    await expect(page.locator(`${frame} .bc-overlay-range`)).toHaveCount(4)

    await page.locator('.chart-edit-toolbar [aria-label="View options"]').click()
    await page.locator('.canvas-view-picker').getByText('BPC', { exact: true }).click()
    await page.keyboard.press('Escape')
    await expect(page.locator('.chart-edit-dsl')).toContainText('overlay "')
  })
})
