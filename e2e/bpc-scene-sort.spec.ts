import { test, expect } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

const BPC_CONTENT = `chart bar-horizontal {
  data {
    "China" = 1050
    "India" = 900
    "United States" = 312
    "Indonesia" = 213
    "Brazil" = 186
    "Russia" = 130
    "Japan" = 118
    "Nigeria" = 110
  }

  scene {
    crosshair = true

    highlight "India" {
      color = "#00d084"
    }

    transform sort {
      columns = "value"
    }
  }

  scene {
    highlight "India" {
      color = "#9900ef"
    }
  }
}`

// BPC DSL scenes map to: Scene 1 (base), Scene 2 (DSL scene 1), Scene 3 (DSL scene 2)
const SCENE_BASE = 0
const SCENE_WITH_SORT = 1
const SCENE_INHERITS_SORT = 2

async function loadBpcFile(page, testInfo) {
  await page.goto('/#/new')
  // Use a unique tmp file per worker to avoid races under parallel execution
  const uniqueName = `test-chart-${testInfo.workerIndex}-${Date.now()}.bpc`
  const tmpFile = path.join(os.tmpdir(), uniqueName)
  fs.writeFileSync(tmpFile, BPC_CONTENT)
  await page.locator('button', { hasText: 'File' }).click()
  await page.locator('input[type="file"]').setInputFiles(tmpFile)
  // Wait for the loaded scene timeline (3 scenes total) to indicate parse + load completed
  await expect(page.locator('.scene-timeline-item')).toHaveCount(3, { timeout: 5000 })
  try { fs.unlinkSync(tmpFile) } catch { /* may have been cleaned up by another worker */ }
}

async function getChartTickLabels(page): Promise<string[]> {
  return page.evaluate(() => {
    const ticks = document.querySelectorAll('.bc-frame-body .bc-axis-vertical .tick text')
    return Array.from(ticks).map(t => t.textContent ?? '')
  })
}

async function getDataTableFirstColumn(page): Promise<string[]> {
  return page.evaluate(() => {
    const rows = document.querySelectorAll('.data-check-table tbody tr')
    return Array.from(rows).map(tr => {
      const cells = tr.querySelectorAll('td')
      return cells[1]?.textContent?.trim() ?? ''
    })
  })
}

const SORTED_ASC = ['Nigeria', 'Japan', 'Russia', 'Brazil', 'Indonesia', 'United States', 'India', 'China']
const UNSORTED = ['China', 'India', 'United States', 'Indonesia', 'Brazil', 'Russia', 'Japan', 'Nigeria']

test.describe('BPC scene sort — file upload', () => {
  test('base scene shows unsorted chart data', async ({ page }, testInfo) => {
    await loadBpcFile(page, testInfo)
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible({ timeout: 10000 })
    await page.locator('.scene-timeline-item').nth(SCENE_BASE).click()
    await expect.poll(() => getChartTickLabels(page)).toEqual(UNSORTED)
  })

  test('scene with sort transform shows sorted chart data', async ({ page }, testInfo) => {
    await loadBpcFile(page, testInfo)
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible({ timeout: 10000 })
    await page.locator('.scene-timeline-item').nth(SCENE_WITH_SORT).click()
    await expect.poll(() => getChartTickLabels(page)).toEqual(SORTED_ASC)
  })

  test('scene inheriting sort shows sorted chart data', async ({ page }, testInfo) => {
    await loadBpcFile(page, testInfo)
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible({ timeout: 10000 })
    await page.locator('.scene-timeline-item').nth(SCENE_INHERITS_SORT).click()
    await expect.poll(() => getChartTickLabels(page)).toEqual(SORTED_ASC)
  })

  test('data table sorted on inherited sort scene', async ({ page }, testInfo) => {
    await loadBpcFile(page, testInfo)
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible({ timeout: 10000 })
    await page.locator('.scene-timeline-item').nth(SCENE_INHERITS_SORT).click()
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Data' }).click()
    await expect(page.locator('.data-check-table')).toBeVisible()
    await expect.poll(() => getDataTableFirstColumn(page)).toEqual(SORTED_ASC)
  })

  test('data table unsorted on base scene', async ({ page }, testInfo) => {
    await loadBpcFile(page, testInfo)
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible({ timeout: 10000 })
    await page.locator('.scene-timeline-item').nth(SCENE_BASE).click()
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Data' }).click()
    await expect(page.locator('.data-check-table')).toBeVisible()
    await expect.poll(() => getDataTableFirstColumn(page)).toEqual(UNSORTED)
  })
})

test.describe('BPC scene sort — session reload', () => {
  test('sort persists after page reload', async ({ page }, testInfo) => {
    await loadBpcFile(page, testInfo)
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible({ timeout: 10000 })

    // Activate the sort scene so it's saved
    await page.locator('.scene-timeline-item').nth(SCENE_INHERITS_SORT).click()
    await expect(page.locator('.scene-timeline-item').nth(SCENE_INHERITS_SORT)).toHaveClass(/scene-timeline-item--active/)

    // Reload the page (session restores from localStorage)
    const url = page.url()
    await page.goto(url)

    // Navigate to Visualize
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible({ timeout: 10000 })

    // Scene 3 should still show sorted data
    await page.locator('.scene-timeline-item').nth(SCENE_INHERITS_SORT).click()
    await expect.poll(() => getChartTickLabels(page)).toEqual(SORTED_ASC)

    // Data table should also be sorted
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Data' }).click()
    await expect(page.locator('.data-check-table')).toBeVisible()
    await expect.poll(() => getDataTableFirstColumn(page)).toEqual(SORTED_ASC)
  })
})
