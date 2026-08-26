import { test, expect } from '@playwright/test'
import { gotoRender } from '../support/render'

test.describe('quoted labels survive the editor round trip', () => {
  test('a label containing a double quote keeps its row', async ({ page }) => {
    await gotoRender(page, `chart bar-vertical {
  title = "Pipe sizes"
  data {
    "5\\" pipe" = 12
    "6 inch" = 8
  }
}`)
    await expect(page.locator('.bc-bar')).toHaveCount(2)
  })

  // Green before the escaping fix: `\\` is not a delimiter for `parseData`, so the
  // row survived. It guards the other direction — an escape written on the way
  // out of `dataEntriesToString` and not read back would now corrupt the label.
  test('a label containing a backslash keeps its row and its text', async ({ page }) => {
    await gotoRender(page, `chart bar-vertical {
  data {
    "C:\\\\x" = 12
    "D" = 8
  }
}`)
    await expect(page.locator('.bc-bar')).toHaveCount(2)
    await expect(page.locator('.bc-axis-horizontal')).toContainText('C:\\x')
  })
})

test.describe('series names with a comma', () => {
  test('a comma inside a series name does not create a phantom series', async ({ page }) => {
    await gotoRender(page, `chart line-multi {
  legend = true
  data {
    series = "Paris, France","Lyon"
    "2020" = 1,2
    "2021" = 3,4
  }
}`)
    const items = page.locator('.bc-legend-item')
    await expect(items).toHaveCount(2)
    await expect(items.first()).toContainText('Paris, France')
  })
})

test.describe('functional colours', () => {
  test('rgb() entries in colors are not shredded into fragments', async ({ page }) => {
    await gotoRender(page, `chart pie {
  colors = "rgb(230,57,70),rgb(69,123,157),rgb(42,157,143)"
  data {
    "A" = 1
    "B" = 1
    "C" = 1
  }
}`)
    const fills = await page.locator('.bc-arc').evaluateAll(
      els => els.map(el => getComputedStyle(el).fill),
    )
    expect(fills).toEqual(['rgb(230, 57, 70)', 'rgb(69, 123, 157)', 'rgb(42, 157, 143)'])
  })
})
