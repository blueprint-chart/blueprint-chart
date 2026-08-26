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

  // Navigate directly to the export step
  await page.goto(`/#/edit/${CHART_ID}/export`)
  await page.waitForLoadState('networkidle')

  // Wait for embed code to appear
  const embedCode = await page.locator('code, pre').filter({ hasText: 'bpc64' }).first()
  await expect(embedCode).toBeVisible({ timeout: 8000 })

  const embedText = await embedCode.textContent()

  // Assertions
  expect(errors.filter(e => e.includes('recursive') || e.includes('Maximum')), 'No recursive update errors').toHaveLength(0)
  expect(warnings, 'No recursive update warnings').toHaveLength(0)
  expect(embedText, 'Embed code should be visible').toBeTruthy()

  const match = embedText?.match(/bpc64=([^"&\s]+)/)
  expect(match?.[1], 'bpc64 should not be empty').toBeTruthy()
})
