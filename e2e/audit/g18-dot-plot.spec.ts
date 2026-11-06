import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gotoRender } from '../support/render'

const samples = resolve(dirname(fileURLToPath(import.meta.url)), '../../packages/lib/src/samples')

const VARIANTS = [
  { name: 'election-polls', dots: 6, legend: [] as string[] },
  { name: 'life-expectancy-gains', dots: 20, legend: ['2000', '2022'] },
].map(variant => ({ ...variant, bpc: readFileSync(resolve(samples, `${variant.name}.bpc`), 'utf-8') }))

const shapes = {
  dots: ['cx', 'cy', 'r'],
  lines: ['d'],
  ranges: ['x', 'y', 'width', 'height'],
}

for (const theme of ['light', 'dark']) {
  for (const { name, bpc, dots, legend } of VARIANTS) {
    test.describe(`G18 dot plot: ${name}, ${theme} theme`, () => {
      test.beforeEach(async ({ page }) => {
        await page.addInitScript(mode => localStorage.setItem('bc-theme', JSON.stringify({ theme: mode })), theme)
        await gotoRender(page, bpc)
        await expect(page.locator('.bc-frame circle.bc-dot')).toHaveCount(dots)
        await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-bs-theme'))).toBe(theme)
      })

      test('no dot, line or range geometry is NaN or empty', async ({ page }) => {
        const selectors = { dots: 'circle.bc-dot', lines: 'path.bc-dot-line', ranges: 'rect.bc-dot-range' }
        const bad: string[] = []
        for (const [kind, selector] of Object.entries(selectors)) {
          const values = await page.locator(`.bc-frame ${selector}`).evaluateAll(
            (marks, attributes) => marks.flatMap(mark => attributes.map(attribute => `${attribute}=${mark.getAttribute(attribute) ?? ''}`)),
            shapes[kind as keyof typeof shapes],
          )
          bad.push(...values.filter(value => value.endsWith('=') || value.includes('NaN')))
        }
        expect(bad).toEqual([])
      })

      test('every dot sits inside the plot clip rect', async ({ page }) => {
        await expect.poll(() => page.evaluate(() => Array.from(
          document.querySelectorAll<SVGCircleElement>('.bc-frame circle.bc-dot'),
          (circle) => {
            const clipUrl = circle.closest('[clip-path]')?.getAttribute('clip-path') ?? ''
            const clipId = clipUrl.match(/url\(#(.+)\)/)?.[1] ?? ''
            const rect = document.getElementById(clipId)?.querySelector('rect')
            if (!rect) {
              return `${circle.dataset.key}: no clip rect`
            }
            const [x, y, width, height] = ['x', 'y', 'width', 'height'].map(attribute => Number(rect.getAttribute(attribute)))
            const cx = Number(circle.getAttribute('cx'))
            const cy = Number(circle.getAttribute('cy'))
            const inside = cx >= x && cx <= x + width && cy >= y && cy <= y + height
            return inside ? null : `${circle.dataset.key}: (${cx}, ${cy}) outside`
          },
        ).filter(Boolean))).toEqual([])
      })

      if (legend.length) {
        test('the legend has one entry per column', async ({ page }) => {
          const entries = page.locator('.bc-frame .bc-legend text')
          await expect(entries).toHaveCount(legend.length)
          expect(await entries.allTextContents()).toEqual(legend)
        })
      }
    })
  }
}
