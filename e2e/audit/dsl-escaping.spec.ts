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
