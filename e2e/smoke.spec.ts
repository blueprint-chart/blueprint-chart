import { test, expect } from '@playwright/test'

test.describe('smoke tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Blueprint Chart')).toBeVisible()
  })

  test('new chart wizard opens', async ({ page }) => {
    await page.goto('/new')
    await expect(page.locator('text=Upload')).toBeVisible()
  })

  test('paste CSV and advance through wizard', async ({ page }) => {
    await page.goto('/new')

    const textarea = page.locator('textarea')
    await textarea.fill('Label,Value\nA,10\nB,20\nC,30')

    await page.locator('button', { hasText: 'Next' }).click()
    await expect(page.locator('.ht_master table').first()).toBeVisible()

    await page.locator('button', { hasText: 'Next' }).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()
  })

  test('editor tabs are accessible', async ({ page }) => {
    await page.goto('/new')

    const textarea = page.locator('textarea')
    await textarea.fill('Label,Value\nA,10\nB,20\nC,30')
    await page.locator('button', { hasText: 'Next' }).click()
    await page.locator('button', { hasText: 'Next' }).click()

    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    for (const tab of ['Text', 'Appearance', 'Layout', 'Axes', 'Annotate']) {
      const tabButton = page.locator(`[title="${tab}"], [aria-label="${tab}"]`).first()
      if (await tabButton.isVisible()) {
        await tabButton.click()
      }
    }
  })

  test('no console errors on homepage', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const realErrors = errors.filter(e => !e.includes('favicon'))
    expect(realErrors).toEqual([])
  })

  test('no console errors in editor', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/new')
    const textarea = page.locator('textarea')
    await textarea.fill('Label,Value\nA,10\nB,20\nC,30')
    await page.locator('button', { hasText: 'Next' }).click()
    await page.locator('button', { hasText: 'Next' }).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    const realErrors = errors.filter(e => !e.includes('favicon'))
    expect(realErrors).toEqual([])
  })
})
