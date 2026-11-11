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

  test('adds a range overlay on one series of a multi-series bar chart', async ({ page }) => {
    const medals = [
      'Nation\tGold\tSilver\tBronze\tTotal',
      'USA\t40\t44\t42\t126',
      'China\t40\t27\t24\t91',
      'Japan\t20\t12\t13\t45',
      'Great Britain\t14\t22\t29\t65',
      'Australia\t18\t19\t16\t53',
      'France\t16\t26\t22\t64',
    ].join('\n')
    await page.goto('/#/new')
    await page.locator('textarea').fill(medals)
    await page.locator('button', { hasText: 'Load data' }).click()
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
    await expect(page.locator(`${frame} svg`)).toBeVisible()

    await page.locator('[aria-label="Chart Type"]').click()
    await page.locator('.editor-chart-type-picker button[value="bar-multi"]').click()

    await page.locator('[aria-label="Annotate"]').click()
    const section = page.locator('.settings-section', { hasText: 'Overlays' })
    await section.getByRole('button', { name: 'Add' }).click()
    await section.getByRole('button', { name: 'Range' }).click()

    const bar = section.locator('.form-control-dropdown', { hasText: 'Bar' })
    await expect(bar).toBeVisible()
    await bar.locator('button').click()
    await page.locator('.dropdown-menu.show .form-control-dropdown-item__content__text__label', { hasText: 'Total' }).click()

    await expect(page.locator(`${frame} .bc-overlay-range`)).toHaveCount(6)

    await page.locator('.chart-edit-toolbar [aria-label="View options"]').click()
    await page.locator('.canvas-view-picker').getByText('BPC', { exact: true }).click()
    await page.keyboard.press('Escape')
    await expect(page.locator('.chart-edit-dsl')).toContainText('bar = "Total"')
  })

  test('fades a bar when its range includes the fade value', async ({ page }) => {
    await page.goto('/#/new')
    await page.getByRole('button', { name: 'Real income gains in 2023' }).click()
    await expect(page.locator(`${frame} svg`)).toBeVisible()

    await page.locator('[aria-label="Annotate"]').click()
    const fade = page.getByLabel('Fade bars when the range includes')
    const faded = page.locator(`${frame} .bc-bar[opacity="0.45"]`)
    await fade.fill('')
    await expect(faded).toHaveCount(0)

    await fade.fill('0')
    await expect(faded).not.toHaveCount(0)
  })
})
