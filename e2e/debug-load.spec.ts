import { test } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const FARM_COMPASS_DSL = fs.readFileSync(
  path.resolve(__dirname, '../packages/lib/src/samples/farm-compass.bpc'),
  'utf-8',
)

const CHART_ID = 'test-farm-compass-x7'

test('trace renders', async ({ page }) => {
  const logs: string[] = []
  
  page.on('console', msg => {
    const text = msg.text()
    if (!text.includes('[vite]')) logs.push(`[${msg.type()}] ${text.substring(0, 400)}`)
  })
  page.on('pageerror', err => logs.push(`[PAGEERROR] ${err.message.substring(0, 300)}`))

  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(({ id, dsl }) => {
    localStorage.setItem(`blueprint-chart:${id}`, dsl)
    localStorage.setItem(`blueprint-chart:${id}:meta`, JSON.stringify({ savedAt: new Date().toISOString() }))
  }, { id: CHART_ID, dsl: FARM_COMPASS_DSL })

  await page.goto(`/#/edit/${CHART_ID}/export`)
  await page.waitForTimeout(4000)

  const errors = logs.filter(l => l.includes('recursive') || l.includes('Maximum') || l.includes('PAGEERROR'))
  console.log('Errors:', errors.length, errors[0]?.substring(0, 200))
  console.log('Warning count:', logs.filter(l => l.includes('[warning]')).length)
  console.log('Last 5 logs:', logs.slice(-5).map(l => l.substring(0, 150)))
})
