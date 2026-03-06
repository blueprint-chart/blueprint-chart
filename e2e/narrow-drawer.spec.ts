import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 600, height: 800 } })

async function loadData(page) {
  await page.goto('/new')
  const textarea = page.locator('textarea')
  await textarea.fill('Label,Value\nA,10\nB,20\nC,30')
  await page.locator('button', { hasText: 'Load data' }).click()
}

async function goToVisualizeStep(page) {
  await loadData(page)
  await page.locator('.navigation-pill__option', { hasText: 'Visualize' }).click()
  await expect(page.locator('.bc-frame-body svg')).toBeVisible()
}

test.describe('Narrow viewport - bottom drawer', () => {
  test('step 1: navbar is not blocked by drawer backdrop on data step', async ({ page }) => {
    await loadData(page)

    const stepper = page.locator('.navigation-pill__option', { hasText: 'Visualize' })
    await expect(stepper).toBeVisible()
    await stepper.click({ timeout: 5000 })
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()
  })

  test('step 2: bottom drawer is within viewport on visualize step', async ({ page }) => {
    await goToVisualizeStep(page)

    // Click a tab to open the drawer
    const rail = page.locator('.navigation-icon-rail--horizontal')
    await expect(rail).toBeVisible()
    await rail.locator('[aria-label="Chart Type"]').click()
    await page.waitForTimeout(500)

    const drawer = page.locator('.layout-bottom-drawer')
    await expect(drawer).toBeVisible()

    // Drawer must be fully within the viewport
    const box = await drawer.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.y + box!.height).toBeLessThanOrEqual(800 + 1)
  })

  test('step 3: navbar remains accessible while drawer is open', async ({ page }) => {
    await goToVisualizeStep(page)

    // Open drawer via icon rail
    await page.locator('.navigation-icon-rail--horizontal [aria-label="Chart Type"]').click()
    await page.waitForTimeout(500)
    await expect(page.locator('.layout-bottom-drawer')).toBeVisible()

    // The navbar stepper must still be clickable even with drawer open
    const dataStep = page.locator('.navigation-pill__option', { hasText: 'Data' })
    await dataStep.click({ timeout: 5000 })
    await expect(page.locator('.data-check-table, textarea')).toBeVisible({ timeout: 5000 })
  })

  test('step 4: clicking backdrop closes the drawer', async ({ page }) => {
    await goToVisualizeStep(page)

    // Open drawer via icon rail
    await page.locator('.navigation-icon-rail--horizontal [aria-label="Chart Type"]').click()
    await page.waitForTimeout(500)

    const drawer = page.locator('.layout-bottom-drawer')
    const backdrop = page.locator('.layout-bottom-drawer__backdrop')
    await expect(drawer).toBeVisible()
    await expect(backdrop).toBeVisible()

    // Click the backdrop (area between navbar and drawer)
    await backdrop.click({ position: { x: 300, y: 200 } })
    await page.waitForTimeout(500)

    // Drawer and backdrop should be gone
    await expect(drawer).not.toBeVisible()
    await expect(backdrop).not.toBeVisible()
  })
})
