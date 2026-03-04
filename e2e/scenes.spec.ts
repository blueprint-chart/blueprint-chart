import { test, expect } from '@playwright/test'

// Helper: navigate to the Visualize step with sample data loaded
async function goToVisualizeStep(page) {
  await page.goto('/new')

  const textarea = page.locator('textarea')
  await textarea.fill('Label,Value\nA,10\nB,20\nC,30')
  await page.locator('button', { hasText: 'Load data' }).click()

  // Use the stepper nav button (not the toolbar button)
  await page.locator('.navigation-pill__option', { hasText: 'Visualize' }).click()
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
    await page.waitForTimeout(500)
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    // Switch to Scene 2
    await page.locator('.scene-timeline-item').nth(1).click()
    await page.waitForTimeout(500)
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    // Switch to Scene 3
    await page.locator('.scene-timeline-item').nth(2).click()
    await page.waitForTimeout(500)
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    // Back to Scene 1
    await page.locator('.scene-timeline-item').first().click()
    await page.waitForTimeout(500)
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    const realErrors = errors.filter(e => !e.includes('favicon'))
    expect(realErrors).toEqual([])
  })

  test('counter shows correct position', async ({ page }) => {
    await goToVisualizeStep(page)

    const counter = page.locator('.scene-timeline__counter')
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
    await page.locator('[aria-label="Previous scene"]').click()
    await expect(items.nth(1)).toHaveClass(/scene-timeline-item--active/)

    // Click prev → Scene 1
    await page.locator('[aria-label="Previous scene"]').click()
    await expect(items.nth(0)).toHaveClass(/scene-timeline-item--active/)

    // Click next → Scene 2
    await page.locator('[aria-label="Next scene"]').click()
    await expect(items.nth(1)).toHaveClass(/scene-timeline-item--active/)
  })

  test('color change on Scene 2 does not affect Scene 1', async ({ page }) => {
    await goToVisualizeStep(page)

    // Open Appearance tab via icon rail button
    await page.locator('[aria-label="Appearance"]').click()

    // Wait for the base color input to appear
    const baseColorInput = page.locator('#bar-base-color')
    await expect(baseColorInput).toBeVisible({ timeout: 5000 })

    // Set base color to a known value
    await baseColorInput.fill('#9900ef')
    await baseColorInput.press('Tab')
    await page.waitForTimeout(500)

    // Verify the bar uses the new base color
    const baseFill = await page.locator('.bc-frame-body rect').first().getAttribute('fill')
    expect(baseFill?.toLowerCase()).toBe('#9900ef')

    // Add Scene 2
    await page.locator('.button-add').click()
    await page.waitForTimeout(300)

    // Change base color to a different value on Scene 2
    await baseColorInput.fill('#0693e3')
    await baseColorInput.press('Tab')
    await page.waitForTimeout(500)

    // Verify Scene 2 bars use the new color
    const scene2Fill = await page.locator('.bc-frame-body rect').first().getAttribute('fill')
    expect(scene2Fill?.toLowerCase()).toBe('#0693e3')

    // Switch to Scene 1 (base)
    await page.locator('.scene-timeline-item').first().click()
    await page.waitForTimeout(500)

    // Verify Scene 1 bars still use the original color (#9900ef)
    const scene1Fill = await page.locator('.bc-frame-body rect').first().getAttribute('fill')
    expect(scene1Fill?.toLowerCase()).toBe('#9900ef')
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
    await page.waitForTimeout(300)

    // Change chart type to bar-horizontal ("Bars") while on Scene 2
    await toggleBtn.click()
    await page.locator('.form-control-dropdown-item__label', { hasText: 'Bars' }).first().click()
    await page.waitForTimeout(500)

    // Verify dropdown now shows "Bars"
    await expect(toggleBtn).toContainText('Bars')

    // Get the current URL (includes session ID for reload)
    const url = page.url()

    // Reload the page
    await page.goto(url)
    await page.waitForTimeout(1000)

    // Navigate to Visualize step
    await page.locator('.navigation-pill__option', { hasText: 'Visualize' }).click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()

    // Verify Scene 2 still exists
    const items = page.locator('.scene-timeline-item')
    await expect(items).toHaveCount(2)

    // Click Scene 1 and open Chart Type tab
    await page.locator('.scene-timeline-item').first().click()
    await page.waitForTimeout(500)
    await page.locator('[aria-label="Chart Type"]').click()

    // Scene 1 (base) should still be "Columns" (bar-vertical)
    await expect(toggleBtn).toContainText('Columns')

    // Click Scene 2 and verify it shows "Bars" (bar-horizontal)
    await page.locator('.scene-timeline-item').nth(1).click()
    await page.waitForTimeout(500)
    await expect(toggleBtn).toContainText('Bars')
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
    await page.waitForTimeout(200)
    await page.locator('.scene-timeline-item').nth(1).click()
    await page.waitForTimeout(200)
    await page.locator('.scene-timeline-item').nth(2).click()
    await page.waitForTimeout(200)

    // Remove a scene
    const scene3 = page.locator('.scene-timeline-item').nth(2)
    await scene3.hover()
    await scene3.locator('.scene-timeline-item__remove').click()
    await page.waitForTimeout(200)

    const realErrors = errors.filter(e => !e.includes('favicon'))
    expect(realErrors).toEqual([])
  })
})
