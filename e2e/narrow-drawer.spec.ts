import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 600, height: 800 } })

async function loadData(page) {
  await page.goto('/#/new')
  const textarea = page.locator('textarea')
  await textarea.fill('Label,Value\nA,10\nB,20\nC,30')
  await page.locator('button', { hasText: 'Load data' }).click()
}

async function dismissDrawerIfOpen(page) {
  const backdrop = page.locator('.layout-bottom-drawer__backdrop')
  if (await backdrop.isVisible().catch(() => false)) {
    await backdrop.click({ position: { x: 300, y: 100 } })
    await expect(backdrop).not.toBeVisible()
  }
}

async function goToVisualizeStep(page) {
  await loadData(page)
  // Loading data opens the structure drawer in narrow mode; the modal
  // backdrop now blocks the navbar, so the drawer must be dismissed
  // before we can click the next stepper.
  await dismissDrawerIfOpen(page)
  await page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' }).click()
  await expect(page.locator('.bc-frame-body svg')).toBeVisible()
}

test.describe('Narrow viewport - bottom drawer', () => {
  test('navbar stepper is intercepted by the backdrop on the data step', async ({ page }) => {
    await loadData(page)

    await expect(page.locator('.layout-bottom-drawer')).toBeVisible()

    const stepper = page.locator('.navigation-stepper-tabs__step', { hasText: 'Visualize' })
    await expect(async () => {
      await stepper.click({ timeout: 1500 })
    }).rejects.toThrow(/intercepts pointer events/)

    // Dismissing the drawer restores access to the stepper.
    await page.locator('.layout-bottom-drawer__backdrop').click({ position: { x: 300, y: 100 } })
    await expect(page.locator('.layout-bottom-drawer')).not.toBeVisible()
    await stepper.click()
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()
  })

  test('bottom drawer is within viewport on visualize step', async ({ page }) => {
    await goToVisualizeStep(page)

    // The horizontal section rail was replaced by a bottom dock with a
    // single primary "open panel" pill that restores the last-used section.
    const openPanel = page.locator('.panel-open-button')
    await expect(openPanel).toBeVisible()
    await openPanel.click()
    await page.waitForTimeout(500)

    const drawer = page.locator('.layout-bottom-drawer')
    await expect(drawer).toBeVisible()

    // Drawer must be fully within the viewport
    const box = await drawer.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.y + box!.height).toBeLessThanOrEqual(800 + 1)
  })

  test('navbar stepper is intercepted by the backdrop while drawer is open', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.panel-open-button').click()
    await page.waitForTimeout(500)
    await expect(page.locator('.layout-bottom-drawer')).toBeVisible()

    const dataStep = page.locator('.navigation-stepper-tabs__step', { hasText: 'Data' })
    await expect(async () => {
      await dataStep.click({ timeout: 1500 })
    }).rejects.toThrow(/intercepts pointer events/)
  })

  test('clicking backdrop closes the drawer', async ({ page }) => {
    await goToVisualizeStep(page)

    // Open drawer via the dock's panel pill (replaces the old icon rail entry).
    await page.locator('.panel-open-button').click()
    await page.waitForTimeout(500)

    const drawer = page.locator('.layout-bottom-drawer')
    const backdrop = page.locator('.layout-bottom-drawer__backdrop')
    await expect(drawer).toBeVisible()
    await expect(backdrop).toBeVisible()

    // Click the backdrop in the navbar y-band — now covered by the modal
    // backdrop after the z-index lift (was previously below the navbar).
    await backdrop.click({ position: { x: 300, y: 200 } })
    await page.waitForTimeout(500)

    // Drawer and backdrop should be gone
    await expect(drawer).not.toBeVisible()
    await expect(backdrop).not.toBeVisible()
  })
})
