import { test, expect } from '@playwright/test'
import { gotoRender } from '../support/render'

async function categoryLabels(page, axis: 'horizontal' | 'vertical'): Promise<string[]> {
  return page.$$eval(
    `.bc-frame-body .bc-axis-${axis} .tick text`,
    nodes => nodes.map(n => n.textContent ?? ''),
  )
}

test.describe('transform sort reaches every chart type', () => {
  test('a line chart honours transform sort', async ({ page }) => {
    await gotoRender(page, `chart line {
  transform sort {
    column = "value"
    direction = descending
  }
  data {
    "Alpha" = 12
    "Beta" = 41
    "Gamma" = 7
  }
}`)
    await expect.poll(() => categoryLabels(page, 'horizontal')).toEqual(['Beta', 'Alpha', 'Gamma'])
  })

  test('a column-stacked chart honours transform sort', async ({ page }) => {
    await gotoRender(page, `chart column-stacked {
  transform sort {
    columns = "A,B"
    operation = "sum"
    direction = descending
  }
  data {
    series = "A","B"
    "Alpha" = 3,4
    "Beta" = 20,30
    "Gamma" = 10,11
  }
}`)
    await expect.poll(() => categoryLabels(page, 'horizontal')).toEqual(['Beta', 'Gamma', 'Alpha'])
  })
})
