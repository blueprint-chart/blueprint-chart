import { test, expect } from '@playwright/test'

const ROUTES = ['/']
const THEMES = ['light', 'dark']

for (const theme of THEMES) {
  for (const route of ROUTES) {
    test(`320px reflow ${route} (${theme})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 })
      await page.addInitScript((t) => {
        localStorage.setItem('bc-theme', JSON.stringify({ theme: t }))
      }, theme)
      await page.route('**/config.json', r => r.fulfill({
        contentType: 'application/json',
        body: '{"supabaseUrl":"http://127.0.0.1:1","supabaseAnonKey":"anon"}',
      }))
      await page.goto(`/#${route}`)
      await expect(page.locator('html')).toHaveAttribute('data-bs-theme', theme)

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scrollWidth).toBeLessThanOrEqual(320)

      if (route === '/') {
        const signIn = page.getByRole('button', { name: 'Sign in' })
        await expect(signIn).toBeVisible()
        const box = await signIn.boundingBox()
        expect(box!.x + box!.width).toBeLessThanOrEqual(320)
      }
    })
  }
}
