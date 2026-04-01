import { test, expect, chromium } from '@playwright/test'

test('export embed - full browser test with recursive update detection', async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  const errors: string[] = []
  const warnings: string[] = []

  page.on('pageerror', err => errors.push(err.message))
  page.on('console', msg => {
    const text = msg.text()
    if (text.includes('recursive') || text.includes('Maximum') || text.includes('Unhandled error')) {
      warnings.push(`[${msg.type()}] ${text}`)
    }
  })

  // Go through wizard with real data
  await page.goto('http://localhost:5555/#/new')
  await page.waitForLoadState('networkidle')

  const textarea = page.locator('textarea')
  await textarea.fill('Label,Value\nQ1,100\nQ2,200\nQ3,150\nQ4,300')
  await page.locator('button', { hasText: 'Load data' }).click()
  await page.locator('.navigation-pill__option', { hasText: 'Visualize' }).click()
  await expect(page.locator('.bc-frame-body svg')).toBeVisible()

  // Set some title and description to make DSL non-trivial
  // Look for the title field
  const titleInput = page.locator('input[placeholder*="title" i], input[placeholder*="Title" i]').first()
  if (await titleInput.isVisible()) {
    await titleInput.fill('My Revenue Chart')
  }

  console.log('At Visualize step, navigating to Export...')
  await page.screenshot({ path: 'test-results/export-full-01.png' })

  // Navigate to Export step
  await page.locator('.navigation-pill__option', { hasText: 'Export' }).click()
  await page.waitForTimeout(1500)

  console.log('At Export step')
  await page.screenshot({ path: 'test-results/export-full-02.png' })

  // Check for errors immediately
  if (errors.length > 0) {
    console.log('PAGE ERRORS:', errors)
  }
  if (warnings.length > 0) {
    console.log('WARNINGS:', warnings)
  }

  // Try to find the embed code
  const codeEl = page.locator('code, pre').filter({ hasText: 'bpc64' }).first()
  const hasCode = await codeEl.isVisible({ timeout: 3000 }).catch(() => false)

  if (!hasCode) {
    console.log('No embed code visible, checking if Embed tab needs clicking...')
    const embedTab = page.locator('[title="Embed"], [aria-label="Embed"]').first()
    if (await embedTab.isVisible()) {
      await embedTab.click()
      await page.waitForTimeout(500)
    }
  }

  await page.screenshot({ path: 'test-results/export-full-03.png' })

  const embedCode = await page.locator('code, pre').filter({ hasText: 'bpc64' }).first().textContent().catch(() => null)
  console.log('Embed code:', embedCode?.substring(0, 200))

  console.log('\n=== RESULTS ===')
  console.log('Page errors:', errors.length, errors)
  console.log('Vue warnings:', warnings.length, warnings)
  console.log('Has embed code:', !!embedCode)
  if (embedCode) {
    const match = embedCode.match(/bpc64=([^"&\s]+)/)
    console.log('bpc64 non-empty:', !!match?.[1])
  }

  await browser.close()

  // Assertions
  expect(errors.filter(e => e.includes('recursive') || e.includes('Maximum')), 'No recursive update errors').toHaveLength(0)
  expect(warnings, 'No recursive update warnings').toHaveLength(0)
  expect(embedCode, 'Embed code should be visible').toBeTruthy()
  const match = embedCode?.match(/bpc64=([^"&\s]+)/)
  expect(match?.[1], 'bpc64 should not be empty').toBeTruthy()
})
