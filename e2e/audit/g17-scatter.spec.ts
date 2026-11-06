import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gotoRender } from '../support/render'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SAMPLE = readFileSync(
  resolve(__dirname, '../../packages/lib/src/samples/life-expectancy-wealth.bpc'),
  'utf-8',
)
const SAMPLE_WITH_LABELS = SAMPLE.replace('trend = "overall"', 'trend = "overall"\n  showLabels = true')

const VARIANTS = [
  { name: 'sample', bpc: SAMPLE },
  { name: 'sample with every label on', bpc: SAMPLE_WITH_LABELS },
]

for (const theme of ['light', 'dark']) {
  for (const { name, bpc } of VARIANTS) {
    test.describe(`G17 scatter: ${name}, ${theme} theme`, () => {
      test.beforeEach(async ({ page }) => {
        await page.addInitScript(mode => localStorage.setItem('bc-theme', JSON.stringify({ theme: mode })), theme)
        await gotoRender(page, bpc)
        await expect(page.locator('.bc-frame circle.bc-scatter-point')).toHaveCount(60)
        await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-bs-theme'))).toBe(theme)
      })

      test('no point geometry is NaN', async ({ page }) => {
        const attributes = await page.locator('.bc-frame circle.bc-scatter-point').evaluateAll(
          circles => circles.flatMap(circle => ['cx', 'cy', 'r'].map(name => circle.getAttribute(name) ?? '')),
        )
        expect(attributes.filter(value => value === '' || value.includes('NaN'))).toEqual([])
      })

      test('every point sits inside the plot clip rect', async ({ page }) => {
        await expect.poll(() => page.evaluate(() => Array.from(
          document.querySelectorAll<SVGCircleElement>('.bc-frame circle.bc-scatter-point'),
          (circle) => {
            const clipUrl = circle.closest('[clip-path]')?.getAttribute('clip-path') ?? ''
            const clipId = clipUrl.match(/url\(#(.+)\)/)?.[1] ?? ''
            const rect = document.getElementById(clipId)?.querySelector('rect')
            if (!rect) {
              return `${circle.dataset.key}: no clip rect`
            }
            const [x, y, width, height] = ['x', 'y', 'width', 'height'].map(name => Number(rect.getAttribute(name)))
            const cx = Number(circle.getAttribute('cx'))
            const cy = Number(circle.getAttribute('cy'))
            const inside = cx >= x && cx <= x + width && cy >= y && cy <= y + height
            return inside ? null : `${circle.dataset.key}: (${cx}, ${cy}) outside`
          },
        ).filter(Boolean))).toEqual([])
      })

      test('no two groups share a legend color', async ({ page }) => {
        const fills = await page.locator('.bc-frame .bc-legend rect').evaluateAll(
          rects => rects.map(rect => rect.getAttribute('fill')),
        )
        expect(fills.length).toBeGreaterThan(1)
        expect(new Set(fills).size).toBe(fills.length)
      })

      test('no two point labels overlap', async ({ page }) => {
        const boxes = await page.locator('.bc-frame text.bc-point-label').evaluateAll(
          labels => labels.map((label) => {
            const { left, top, right, bottom } = label.getBoundingClientRect()
            return { text: label.textContent, left, top, right, bottom }
          }),
        )
        expect(boxes.length).toBeGreaterThan(0)
        const overlaps = boxes.flatMap((a, i) => boxes.slice(i + 1)
          .filter(b => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom)
          .map(b => `${a.text} / ${b.text}`))
        expect(overlaps).toEqual([])
      })
    })
  }
}
