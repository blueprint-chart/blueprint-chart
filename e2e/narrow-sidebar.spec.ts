import { test, expect } from '@playwright/test'

test.describe('Narrow viewport - sidebar offcanvas', () => {
  test.use({ viewport: { width: 600, height: 800 } })

  test('in-flow sidebar is hidden at narrow', async ({ page }) => {
    await page.goto('/#/charts')
    // The aside is in the DOM but hidden via display:none from the SCSS mixin.
    const aside = page.locator('.layout-shell__sidebar')
    await expect(aside).toBeHidden()
  })

  test('topbar shows hamburger + logo + breadcrumb at narrow', async ({ page }) => {
    await page.goto('/#/charts')
    const lead = page.locator('.layout-navbar__lead')
    await expect(lead).toBeVisible()
    await expect(lead.locator('button[aria-label="Open navigation"]')).toBeVisible()
    await expect(lead.locator('.navigation-workspace-switcher__logo')).toBeVisible()
    await expect(lead.locator('.navigation-workspace-switcher__name')).toHaveText('Blueprint Chart')
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible()
  })

  test('clicking hamburger opens the offcanvas with sidebar content', async ({ page }) => {
    await page.goto('/#/charts')
    const hamburger = page.locator('.layout-navbar__lead button[aria-label="Open navigation"]')
    await hamburger.click()

    const offcanvas = page.locator('#layout-sidebar-offcanvas')
    await expect(offcanvas).toBeVisible()
    await expect(offcanvas.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(offcanvas.getByRole('link', { name: 'My Charts' })).toBeVisible()
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true')
  })

  test('clicking the backdrop closes the offcanvas', async ({ page }) => {
    await page.goto('/#/charts')
    await page.locator('.layout-navbar__lead button[aria-label="Open navigation"]').click()
    await expect(page.locator('#layout-sidebar-offcanvas')).toBeVisible()

    // Bootstrap renders .offcanvas-backdrop on body when an offcanvas is open.
    await page.locator('.offcanvas-backdrop').click()
    await expect(page.locator('#layout-sidebar-offcanvas')).toBeHidden()
  })

  test('Esc closes the offcanvas', async ({ page }) => {
    await page.goto('/#/charts')
    await page.locator('.layout-navbar__lead button[aria-label="Open navigation"]').click()
    const offcanvas = page.locator('#layout-sidebar-offcanvas')
    await expect(offcanvas).toBeVisible()
    // BOffcanvas focuses itself on open; click inside to ensure keyboard target is within it.
    await offcanvas.click()

    await page.keyboard.press('Escape')
    await expect(offcanvas).toBeHidden()
  })

  test('clicking a sidebar link closes offcanvas AND navigates', async ({ page }) => {
    await page.goto('/#/charts')
    await page.locator('.layout-navbar__lead button[aria-label="Open navigation"]').click()
    await expect(page.locator('#layout-sidebar-offcanvas')).toBeVisible()

    await page.locator('#layout-sidebar-offcanvas').getByRole('link', { name: 'Home' }).click()

    await expect(page).toHaveURL(/#\/$/)
    await expect(page.locator('#layout-sidebar-offcanvas')).toBeHidden()
  })

  test('clicking the in-sidebar close button closes the offcanvas', async ({ page }) => {
    await page.goto('/#/charts')
    await page.locator('.layout-navbar__lead button[aria-label="Open navigation"]').click()
    const offcanvas = page.locator('#layout-sidebar-offcanvas')
    await expect(offcanvas).toBeVisible()

    // Close button lives in the LayoutSidebar header alongside the workspace switcher.
    await offcanvas.locator('button[aria-label="Close"]').click()
    await expect(offcanvas).toBeHidden()
  })
})

test.describe('Wide viewport regression', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('hamburger and topbar logo are hidden at wide', async ({ page }) => {
    await page.goto('/#/charts')
    // .layout-navbar__lead exists in the DOM but is hidden by Bootstrap's d-xl-none utility.
    await expect(page.locator('.layout-navbar__lead')).toBeHidden()
  })

  test('in-flow sidebar is visible at wide', async ({ page }) => {
    await page.goto('/#/charts')
    await expect(page.locator('.layout-shell__sidebar')).toBeVisible()
    await expect(page.locator('.layout-shell__sidebar .navigation-sidebar')).toBeVisible()
  })

  test('BOffcanvas is not in the DOM at wide', async ({ page }) => {
    await page.goto('/#/charts')
    await expect(page.locator('#layout-sidebar-offcanvas')).toHaveCount(0)
  })
})
