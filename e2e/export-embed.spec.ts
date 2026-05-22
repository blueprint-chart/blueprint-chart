import { test, expect } from '@playwright/test'

test('export embed code has non-empty bpc64 and no recursive update errors', async ({ page }) => {
  const vueWarnings: string[] = []
  page.on('console', msg => {
    const text = msg.text()
    if (msg.type() === 'warning' && (text.includes('recursive') || text.includes('Maximum'))) {
      vueWarnings.push(text)
    }
  })
  page.on('pageerror', err => {
    vueWarnings.push(err.message)
  })

  // Create a chart via the wizard
  await page.goto('/#/new')
  const textarea = page.locator('textarea')
  await textarea.fill('Label,Value\nA,10\nB,20\nC,30')
  await page.locator('button', { hasText: 'Load data' }).click()
  await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
  await expect(page.locator('.bc-frame-body svg')).toBeVisible()

  // Navigate to the Export step
  await page.locator('.navigation-stepper-tabs__step', { hasText: 'Export' }).click()

  // The Embed tab should be visible or already active
  const embedTab = page.locator('[title="Embed"], [aria-label="Embed"]').first()
  if (await embedTab.isVisible()) {
    await embedTab.click()
  }

  // Find the embed code containing bpc64
  const codeEl = page.locator('code, pre').filter({ hasText: 'bpc64' }).first()
  await expect(codeEl).toBeVisible({ timeout: 5000 })
  const embedCode = await codeEl.textContent()

  // bpc64 must not be empty
  expect(embedCode).toContain('bpc64=')
  const match = embedCode?.match(/bpc64=([^"&\s]+)/)
  expect(match?.[1], 'bpc64 value should not be empty').toBeTruthy()

  // No recursive update errors
  expect(vueWarnings, `Vue warnings: ${vueWarnings.join(', ')}`).toHaveLength(0)
})
