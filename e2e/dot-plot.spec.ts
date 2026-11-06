import { test, expect } from '@playwright/test'
import { gotoRender } from './support/render'

const PARTIES = ['CDU/CSU', 'Greens', 'SPD', 'AfD', 'FDP', 'Left']

const TSV = [
  'Party\tPoll\tHigh\tLow',
  'CDU/CSU\t29\t32\t27',
  'Greens\t22\t25\t20',
  'SPD\t14\t16\t12',
  'AfD\t10\t12\t8',
  'FDP\t10\t12\t8',
  'Left\t7\t9\t5',
].join('\n')

const SCENES = `chart dot-plot {
  title = "Polls"
  dotStyle = "range"
  data {
    series = "Poll","High","Low"
    "CDU/CSU" = 29,32,27
    "Greens"  = 22,25,20
    "SPD"     = 14,16,12
    "AfD"     = 10,12,8
    "FDP"     = 10,12,8
    "Left"    = 7,9,5
  }

  scene "Spotlight" {
    title = "SPD in focus"
    highlight "SPD"
  }

  scene "New numbers" {
    title = "A month later"
    data {
      series = "Poll","High","Low"
      "CDU/CSU" = 25,28,23
      "Greens"  = 26,29,24
      "SPD"     = 18,20,16
      "AfD"     = 11,13,9
      "FDP"     = 12,14,10
      "Left"    = 6,8,4
    }
  }
}`

const frame = '.bc-frame-body'
const dots = `${frame} circle.bc-dot`
const ranges = `${frame} rect.bc-dot-range`
const lines = `${frame} path.bc-dot-line`

const expectOnlySpdLit = (page: import('@playwright/test').Page, selector: string, count: number) =>
  expect.poll(async () => {
    const marks = await opacities(page, selector)
    return marks.length === count ? marks.filter(([row, opacity]) => opacity !== (row === 'SPD' ? '1' : '0.35')) : 'wrong count'
  }).toEqual([])

const opacities = (page: import('@playwright/test').Page, selector: string) =>
  page.locator(selector).evaluateAll(marks => marks.map(mark => [mark.getAttribute('data-key')!.split('|')[0], mark.getAttribute('opacity')]))

test.describe('dot plot authoring', () => {
  test('pasted data stays a dumbbell until the range style is picked', async ({ page }) => {
    await page.goto('/#/new')
    await page.locator('textarea').fill(TSV)
    await page.locator('button', { hasText: 'Load data' }).click()
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
    await expect(page.locator(`${frame} svg`)).toBeVisible()

    await page.locator('[aria-label="Chart Type"]').click()
    await page.locator('.form-control-dropdown__toggle .dropdown-toggle').click()
    await page.locator('.form-control-dropdown-item__content__text__label', { hasText: 'Dot plot' }).first().click()
    await expect(page.locator(ranges)).toHaveCount(0)
    await expect(page.locator(lines)).toHaveCount(6)

    await page.locator('[aria-label="Style"]').click()

    const collapsed = (d: string) => {
      const [anchor, tip] = d.split('M')[2].split('L').map(point => point.trim())
      return anchor === tip
    }
    const firstLine = page.locator(lines).first()
    expect(collapsed((await firstLine.getAttribute('d'))!)).toBe(true)
    await page.locator('.editor-dot-plot-settings__arrows').getByRole('button', { name: 'Forward' }).click()
    await expect.poll(async () => collapsed((await firstLine.getAttribute('d'))!)).toBe(false)

    await page.locator('.editor-dot-plot-settings__style').getByRole('button', { name: 'Range' }).click()
    await expect(page.locator(ranges)).toHaveCount(6)
    await expect(page.locator('#dot-plot-low')).toHaveValue('')

    await page.locator('[aria-label="Annotate"]').click()
    await page.locator('.form-control-checkbox', { hasText: 'Highlight specific items' }).locator('label').click()
    await page.locator('.list-item-row', { hasText: 'SPD' }).first().click()

    await expectOnlySpdLit(page, dots, 6)
    await expectOnlySpdLit(page, ranges, 6)
  })
})

test.describe('dot plot scenes', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await gotoRender(page, SCENES)
    await expect(page.locator(dots)).toHaveCount(6)
  })

  test('the highlight dims the other rows and the next scene clears it', async ({ page }) => {
    await page.locator('.bc-frame [aria-label="Next scene"]').click()
    await expect(page.locator('.bc-frame')).toContainText('SPD in focus')
    await expectOnlySpdLit(page, dots, 6)
    await expectOnlySpdLit(page, ranges, 6)

    await page.locator('.bc-frame [aria-label="Next scene"]').click()
    await expect(page.locator('.bc-frame')).toContainText('A month later')
    await expect.poll(async () => new Set((await opacities(page, dots)).map(([, opacity]) => opacity)).size).toBe(1)
    expect((await opacities(page, dots))[0][1]).toBe('1')
    expect(new Set((await opacities(page, ranges)).map(([, opacity]) => opacity))).toEqual(new Set(['1']))
  })

  test('a kept dot glides to its new position', async ({ page }) => {
    const next = page.locator('.bc-frame [aria-label="Next scene"]')
    await next.click()
    await expect(page.locator('.bc-frame')).toContainText('SPD in focus')
    await page.waitForTimeout(1500)

    await page.evaluate(() => {
      const w = window as unknown as { cxTrace: string[] }
      w.cxTrace = []
      const start = performance.now()
      const tick = () => {
        w.cxTrace.push(document.querySelector('circle.bc-dot[data-key="SPD|Poll"]')?.getAttribute('cx') ?? '')
        if (performance.now() - start < 1000) {
          requestAnimationFrame(tick)
        }
      }
      requestAnimationFrame(tick)
    })
    await next.click()
    await expect(page.locator('.bc-frame')).toContainText('A month later')
    await expect.poll(() => page.evaluate(() => (window as unknown as { cxTrace: string[] }).cxTrace.length), { timeout: 3000 }).toBeGreaterThan(30)

    const distinct = await page.evaluate(() => new Set((window as unknown as { cxTrace: string[] }).cxTrace).size)
    expect(distinct).toBeGreaterThan(5)
  })
})
