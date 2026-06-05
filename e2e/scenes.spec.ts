import { test, expect } from '@playwright/test'

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

function normalizeColor(color: string): string {
  const c = color.trim().toLowerCase()
  if (c.startsWith('#')) { return hexToRgb(c) }
  return c
}

// Helper: navigate to the Visualize step with sample data loaded
async function goToVisualizeStep(page) {
  await page.goto('/#/new')

  const textarea = page.locator('textarea')
  await textarea.fill('Label,Value\nA,10\nB,20\nC,30')
  await page.locator('button', { hasText: 'Load data' }).click()

  // Use the stepper nav button (not the toolbar button)
  await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
  await expect(page.locator('.bc-frame-body svg')).toBeVisible()
}

test.describe('Scene Timeline', () => {
  test('timeline is visible on visualize step', async ({ page }) => {
    await goToVisualizeStep(page)
    await expect(page.locator('.scene-timeline')).toBeVisible()
  })

  test('Scene 1 (base) is always shown and active', async ({ page }) => {
    await goToVisualizeStep(page)

    const items = page.locator('.scene-timeline-item')
    await expect(items).toHaveCount(1)
    await expect(items.first().locator('.scene-timeline-item__label')).toHaveText('Scene 1')
    await expect(items.first()).toHaveClass(/scene-timeline-item--active/)
  })

  test('Scene 1 has no remove button', async ({ page }) => {
    await goToVisualizeStep(page)

    const firstItem = page.locator('.scene-timeline-item').first()
    await firstItem.hover()
    await expect(firstItem.locator('.scene-timeline-item__remove')).toHaveCount(0)
  })

  test('Add button creates Scene 2 and activates it', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()

    const items = page.locator('.scene-timeline-item')
    await expect(items).toHaveCount(2)
    await expect(items.nth(0).locator('.scene-timeline-item__label')).toHaveText('Scene 1')
    await expect(items.nth(1).locator('.scene-timeline-item__label')).toHaveText('Scene 2')
    // Scene 2 is active
    await expect(items.nth(1)).toHaveClass(/scene-timeline-item--active/)
    await expect(items.nth(0)).not.toHaveClass(/scene-timeline-item--active/)
  })

  test('clicking Scene 1 switches back to base', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()
    // Scene 2 is active
    await expect(page.locator('.scene-timeline-item').nth(1)).toHaveClass(/scene-timeline-item--active/)

    // Click Scene 1
    await page.locator('.scene-timeline-item').first().click()
    await expect(page.locator('.scene-timeline-item').first()).toHaveClass(/scene-timeline-item--active/)
    await expect(page.locator('.scene-timeline-item').nth(1)).not.toHaveClass(/scene-timeline-item--active/)
  })

  test('Scene 2 has remove button', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()

    const scene2 = page.locator('.scene-timeline-item').nth(1)
    await scene2.hover()
    await expect(scene2.locator('.scene-timeline-item__remove')).toBeVisible()
  })

  test('removing Scene 2 goes back to just Scene 1', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()
    await expect(page.locator('.scene-timeline-item')).toHaveCount(2)

    // Remove Scene 2
    const scene2 = page.locator('.scene-timeline-item').nth(1)
    await scene2.hover()
    await scene2.locator('.scene-timeline-item__remove').click()

    await expect(page.locator('.scene-timeline-item')).toHaveCount(1)
    await expect(page.locator('.scene-timeline-item').first().locator('.scene-timeline-item__label')).toHaveText('Scene 1')
  })

  test('switching scenes re-renders the chart without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await goToVisualizeStep(page)

    // Add two scenes
    await page.locator('.button-add').click()
    await page.locator('.button-add').click()

    // Switch to Scene 1 (base)
    await page.locator('.scene-timeline-item').first().click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    // Switch to Scene 2
    await page.locator('.scene-timeline-item').nth(1).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    // Switch to Scene 3
    await page.locator('.scene-timeline-item').nth(2).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    // Back to Scene 1
    await page.locator('.scene-timeline-item').first().click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    const realErrors = errors.filter(e => !e.includes('favicon'))
    expect(realErrors).toEqual([])
  })

  test('counter shows correct position', async ({ page }) => {
    await goToVisualizeStep(page)

    const counter = page.locator('.scene-timeline-controls__counter')
    await expect(counter).toHaveText('1 / 1')

    // Add Scene 2
    await page.locator('.button-add').click()
    await expect(counter).toHaveText('2 / 2')

    // Click Scene 1
    await page.locator('.scene-timeline-item').first().click()
    await expect(counter).toHaveText('1 / 2')
  })

  test('can add multiple scenes', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()
    await page.locator('.button-add').click()
    await page.locator('.button-add').click()

    const items = page.locator('.scene-timeline-item')
    await expect(items).toHaveCount(4)
    // Last added scene (Scene 4) should be active
    await expect(items.nth(3)).toHaveClass(/scene-timeline-item--active/)
  })

  test('prev/next buttons navigate scenes', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()
    await page.locator('.button-add').click()

    const items = page.locator('.scene-timeline-item')
    // Scene 3 is active
    await expect(items.nth(2)).toHaveClass(/scene-timeline-item--active/)

    // Click prev → Scene 2
    await page.locator('.scene-timeline [aria-label="Previous scene"]').click()
    await expect(items.nth(1)).toHaveClass(/scene-timeline-item--active/)

    // Click prev → Scene 1
    await page.locator('.scene-timeline [aria-label="Previous scene"]').click()
    await expect(items.nth(0)).toHaveClass(/scene-timeline-item--active/)

    // Click next → Scene 2
    await page.locator('.scene-timeline [aria-label="Next scene"]').click()
    await expect(items.nth(1)).toHaveClass(/scene-timeline-item--active/)
  })

  test('color change on Scene 2 does not affect Scene 1', async ({ page }) => {
    await goToVisualizeStep(page)

    // Open Appearance tab via icon rail button
    await page.locator('[aria-label="Style"]').click()

    // Wait for the base color input to appear
    const baseColorInput = page.locator('#bar-base-color')
    await expect(baseColorInput).toBeVisible({ timeout: 5000 })

    // Set base color to a known value
    await baseColorInput.fill('#9900ef')
    await baseColorInput.press('Tab')

    // Verify the bar uses the new base color (skip the .bc-canvas-bg rect)
    const firstRect = page.locator('.bc-frame-body rect.bc-bar').first()
    await expect.poll(() => firstRect.getAttribute('fill').then(c => normalizeColor(c ?? ''))).toBe(normalizeColor('#9900ef'))

    // Add Scene 2
    await page.locator('.button-add').click()
    await expect(page.locator('.scene-timeline-item')).toHaveCount(2)

    // Change base color to a different value on Scene 2
    await baseColorInput.fill('#0693e3')
    await baseColorInput.press('Tab')

    // Verify Scene 2 bars use the new color
    await expect.poll(() => firstRect.getAttribute('fill').then(c => normalizeColor(c ?? ''))).toBe(normalizeColor('#0693e3'))

    // Switch to Scene 1 (base)
    await page.locator('.scene-timeline-item').first().click()

    // Verify Scene 1 bars still use the original color (#9900ef)
    await expect.poll(() => firstRect.getAttribute('fill').then(c => normalizeColor(c ?? ''))).toBe(normalizeColor('#9900ef'))
  })

  test('scene chart type override persists through reload', async ({ page }) => {
    await goToVisualizeStep(page)

    // Open Chart Type tab
    await page.locator('[aria-label="Chart Type"]').click()

    // Verify base type shows "Columns" (bar-vertical)
    const toggleBtn = page.locator('.form-control-dropdown__toggle .dropdown-toggle')
    await expect(toggleBtn).toContainText('Columns')

    // Add Scene 2
    await page.locator('.button-add').click()
    await expect(page.locator('.scene-timeline-item')).toHaveCount(2)

    // Change chart type to bar-horizontal ("Bars") while on Scene 2
    await toggleBtn.click()
    await page.locator('.form-control-dropdown-item__content__text__label', { hasText: 'Bars' }).first().click()

    // Verify dropdown now shows "Bars"
    await expect(toggleBtn).toContainText('Bars')

    // Get the current URL (includes session ID for reload)
    const url = page.url()

    // Reload the page
    await page.goto(url)

    // Navigate to Visualize step
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
    // Wait for the live frame (not the fade-snapshot used during scene transitions)
    await expect(page.locator('.bc-frame:not(.bc-frame--fade-snapshot) .bc-frame-body svg')).toBeVisible()

    // Verify Scene 2 still exists
    const items = page.locator('.scene-timeline-item')
    await expect(items).toHaveCount(2)

    // Click Scene 1 and open Chart Type tab
    await page.locator('.scene-timeline-item').first().click()
    await page.locator('[aria-label="Chart Type"]').click()

    // Scene 1 (base) should still be "Columns" (bar-vertical)
    await expect(toggleBtn).toContainText('Columns')

    // Click Scene 2 and verify it shows "Bars" (bar-horizontal)
    await page.locator('.scene-timeline-item').nth(1).click()
    await expect(toggleBtn).toContainText('Bars')
  })

  test('new scene does not get unnecessary data block after navigating to Data step', async ({ page }) => {
    await goToVisualizeStep(page)

    // Add Scene 2 (it becomes active)
    await page.locator('.button-add').click()
    await expect(page.locator('.scene-timeline-item')).toHaveCount(2)

    // Navigate back to Data step then forward to Visualize
    // This triggers the watch in WizardShell that serializes data
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Data' }).click()
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    // Navigate to Export step to inspect DSL via iframe embed URL
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Export' }).click()
    const codeBlock = page.locator('.export-embed-block__pre code')
    await expect(codeBlock).toBeVisible()

    // Extract DSL from the iframe bpc64 query param
    const iframeCode = await codeBlock.innerText()
    const bpc64Match = iframeCode.match(/bpc64=([^"&]+)/)
    expect(bpc64Match).not.toBeNull()
    const dslContent = Buffer.from(decodeURIComponent(bpc64Match![1]), 'base64').toString()

    // Extract the scene block
    const sceneBlockMatch = dslContent.match(/scene\s*\{([\s\S]*?)\}/)
    expect(sceneBlockMatch).not.toBeNull()

    // The scene block should NOT contain a data block
    expect(sceneBlockMatch![1]).not.toContain('data {')
  })

  test('scene thumbnails are visible in timeline', async ({ page }) => {
    await goToVisualizeStep(page)

    // Base scene should have a thumbnail
    const basePreview = page.locator('.scene-timeline-item').first().locator('.scene-timeline-item__preview svg')
    await expect(basePreview).toBeVisible()

    // Add Scene 2
    await page.locator('.button-add').click()

    // Both scenes should have thumbnails
    const items = page.locator('.scene-timeline-item')
    await expect(items.nth(0).locator('.scene-timeline-item__preview svg')).toBeVisible()
    await expect(items.nth(1).locator('.scene-timeline-item__preview svg')).toBeVisible()
  })

  test('timeline is visible on data step when scenes exist', async ({ page }) => {
    await goToVisualizeStep(page)

    // Add a scene on Visualize step
    await page.locator('.button-add').click()
    await expect(page.locator('.scene-timeline-item')).toHaveCount(2)

    // Navigate back to Data step
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Data' }).click()

    // Timeline should be visible on Data step
    await expect(page.locator('.scene-timeline')).toBeVisible()
    await expect(page.locator('.scene-timeline-item')).toHaveCount(2)
  })

  test('scene data step shows table with banner and hides parsing tab', async ({ page }) => {
    await goToVisualizeStep(page)

    // Add a scene
    await page.locator('.button-add').click()

    // Navigate back to Data step
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Data' }).click()

    // Select Scene 2 (non-base)
    await page.locator('.scene-timeline-item').nth(1).click()

    // Table should be visible
    await expect(page.locator('.data-check-table')).toBeVisible()

    // Scene banner replaces the insight badges
    await expect(page.locator('.data-structure-panel__main__scene-banner')).toBeVisible()
    await expect(page.locator('.data-structure-panel__main__scene-banner')).toContainText('Scene override active')
    await expect(page.locator('.data-insight-badges')).toHaveCount(0)

    // Side panel / icon rail should still be visible
    await expect(page.locator('.navigation-icon-rail')).toBeVisible()

    // Parsing icon should not be in the rail
    await expect(page.locator('.navigation-icon-rail [aria-label="Parsing"]')).toHaveCount(0)

    // Switch back to Scene 1 (base) — banner goes away, badges return
    await page.locator('.scene-timeline-item').first().click()

    await expect(page.locator('.data-insight-badges')).toBeVisible()
    await expect(page.locator('.data-structure-panel__main__scene-banner')).toHaveCount(0)
    // Parsing icon should be back
    await expect(page.locator('.navigation-icon-rail [aria-label="Parsing"]')).toBeVisible()
  })

  test('scene transforms persist when switching scenes on data step', async ({ page }) => {
    await goToVisualizeStep(page)

    // Add a scene
    await page.locator('.button-add').click()

    // Navigate back to Data step
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Data' }).click()

    // Select Scene 2
    await page.locator('.scene-timeline-item').nth(1).click()

    // Open transforms panel via icon rail
    await page.locator('[aria-label="Transforms"]').click()

    // Add a transform step on Scene 2
    const addBtn = page.locator('[data-testid="transform-pipeline"] .button-add, [data-testid="transform-pipeline"] [aria-label="Add transform"]').first()
    if (await addBtn.isVisible()) {
      await addBtn.click()
    }

    // Switch to Scene 1 (base)
    await page.locator('.scene-timeline-item').first().click()

    // Switch back to Scene 2
    await page.locator('.scene-timeline-item').nth(1).click()

    // Open transforms panel again and verify pipeline is still shown
    await page.locator('[aria-label="Transforms"]').click()
    await expect(page.locator('[data-testid="transform-pipeline"]')).toBeVisible()
  })

  test('scene transforms affect scene chart data', async ({ page }) => {
    // Use 4-column data so we can use multi-series and hide a column
    await page.goto('/#/new')
    const textarea = page.locator('textarea')
    await textarea.fill('Label,Series A,Series B\nX,10,20\nY,30,40')
    await page.locator('button', { hasText: 'Load data' }).click()

    // Go to Visualize
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    // Add Scene 2
    await page.locator('.button-add').click()

    // Navigate back to Data step
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Data' }).click()

    // Select Scene 2
    await page.locator('.scene-timeline-item').nth(1).click()

    // Open transforms panel and add a Transpose transform (no config needed)
    await page.locator('[aria-label="Transforms"]').click()

    const addBtn = page.locator('[data-testid="transform-pipeline"] .button-add').first()
    await addBtn.click()

    // Select "Transpose" from the dropdown
    await page.locator('.add-wrap__dropdown__item__text__name', { hasText: 'Transpose' }).click()

    // Navigate to Visualize step
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    // Switch to Scene 2 — chart should render with transposed data
    await page.locator('.scene-timeline-item').nth(1).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    // Get DSL output to verify scene does NOT bake a data block
    await page.locator('.navigation-stepper-tabs__step', { hasText: 'Export' }).click()
    const codeBlock = page.locator('.export-embed-block__pre code')
    await expect(codeBlock).toBeVisible()

    // Extract DSL from the iframe bpc64 query param
    const iframeCode = await codeBlock.innerText()
    const bpc64Match = iframeCode.match(/bpc64=([^"&]+)/)
    expect(bpc64Match).not.toBeNull()
    const dslContent = Buffer.from(decodeURIComponent(bpc64Match![1]), 'base64').toString()

    const sceneBlockMatch = dslContent.match(/scene\s*\{([\s\S]*?)\}/)
    expect(sceneBlockMatch).not.toBeNull()

    // Scene should NOT have a data block — transforms are applied at render time
    expect(sceneBlockMatch![1]).not.toContain('data {')
  })

  test('no console errors during scene operations', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await goToVisualizeStep(page)

    // Add scenes
    await page.locator('.button-add').click()
    await page.locator('.button-add').click()

    // Switch between scenes
    await page.locator('.scene-timeline-item').first().click()
    await expect(page.locator('.scene-timeline-item').first()).toHaveClass(/scene-timeline-item--active/)
    await page.locator('.scene-timeline-item').nth(1).click()
    await expect(page.locator('.scene-timeline-item').nth(1)).toHaveClass(/scene-timeline-item--active/)
    await page.locator('.scene-timeline-item').nth(2).click()
    await expect(page.locator('.scene-timeline-item').nth(2)).toHaveClass(/scene-timeline-item--active/)

    // Remove a scene
    const scene3 = page.locator('.scene-timeline-item').nth(2)
    await scene3.hover()
    await scene3.locator('.scene-timeline-item__remove').click()
    await expect(page.locator('.scene-timeline-item')).toHaveCount(2)

    const realErrors = errors.filter(e => !e.includes('favicon'))
    expect(realErrors).toEqual([])
  })
})
