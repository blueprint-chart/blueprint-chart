import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const FARM_COMPASS_DSL = fs.readFileSync(
  path.resolve(__dirname, '../packages/lib/src/samples/farm-compass.bpc'),
  'utf-8',
)

const CHART_ID = 'test-farm-compass-export'

test('export embed - farm-compass complex chart has non-empty bpc64 and no recursive errors', async ({ page }) => {
  const errors: string[] = []
  const warnings: string[] = []

  page.on('pageerror', err => errors.push(err.message))
  page.on('console', msg => {
    const text = msg.text()
    if (text.includes('recursive') || text.includes('Maximum') || text.includes('Unhandled error')) {
      warnings.push(`[${msg.type()}] ${text}`)
    }
  })

  // Pre-load farm-compass DSL into localStorage so the editor can open it directly
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(({ id, dsl }) => {
    localStorage.setItem(`blueprint-chart:${id}`, dsl)
    localStorage.setItem(`blueprint-chart:${id}:meta`, JSON.stringify({ savedAt: new Date().toISOString() }))
  }, { id: CHART_ID, dsl: FARM_COMPASS_DSL })

  // Navigate directly to the export step (use full URL to ensure Playwright triggers proper navigation)
  await page.goto(`http://localhost:5555/#/edit/${CHART_ID}/export`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)

  await page.screenshot({ path: 'test-results/export-farm-compass-01.png' })

  // Check for errors right away
  if (errors.length > 0) console.log('PAGE ERRORS:', errors)
  if (warnings.length > 0) console.log('WARNINGS:', warnings)

  // Look for the embed code
  const codeEl = page.locator('code, pre').filter({ hasText: 'bpc64' }).first()
  const hasCode = await codeEl.isVisible({ timeout: 5000 }).catch(() => false)

  if (!hasCode) {
    // Try clicking Embed tab
    const embedTab = page.locator('[title="Embed"], [aria-label="Embed"]').first()
    if (await embedTab.isVisible()) {
      await embedTab.click()
      await page.waitForTimeout(500)
    }
  }

  await page.screenshot({ path: 'test-results/export-farm-compass-02.png' })

  const embedCode = await page.locator('code, pre').filter({ hasText: 'bpc64' }).first().textContent().catch(() => null)
  console.log('Embed code:', embedCode?.substring(0, 300))

  console.log('\n=== RESULTS ===')
  console.log('Page errors:', errors.length, errors)
  console.log('Vue warnings:', warnings.length, warnings)
  console.log('Has embed code:', !!embedCode)
  if (embedCode) {
    const match = embedCode.match(/bpc64=([^"&\s]+)/)
    console.log('bpc64 non-empty:', !!match?.[1])
  }

  // Assertions
  expect(errors.filter(e => e.includes('recursive') || e.includes('Maximum')), 'No recursive update errors').toHaveLength(0)
  expect(warnings, 'No recursive update warnings').toHaveLength(0)
  expect(embedCode, 'Embed code should be visible').toBeTruthy()
  const match = embedCode?.match(/bpc64=([^"&\s]+)/)
  expect(match?.[1], 'bpc64 should not be empty').toBeTruthy()
})
