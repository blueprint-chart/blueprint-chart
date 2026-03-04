import { test, expect } from '@playwright/test'

async function goToVisualizeStep(page) {
  await page.goto('/new')

  const textarea = page.locator('textarea')
  await textarea.fill('Label,Value\nA,10\nB,20\nC,30')
  await page.locator('button', { hasText: 'Load data' }).click()

  await page.locator('.navigation-pill__option', { hasText: 'Visualize' }).click()
  await expect(page.locator('.bc-frame-body svg')).toBeVisible()
}

test.describe('Scene Player', () => {
  test('player is not visible when no scenes added', async ({ page }) => {
    await goToVisualizeStep(page)
    await expect(page.locator('[data-scene-player]')).toHaveCount(0)
  })

  test('player appears inside .bc-frame when scene is added', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()
    await page.waitForTimeout(500)

    const player = page.locator('.bc-frame [data-scene-player]')
    await expect(player).toBeVisible()
  })

  test('default player is progress bar with segments', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()
    await page.waitForTimeout(500)

    const player = page.locator('.bc-frame [data-scene-player]')
    await expect(player).toHaveClass(/bc-scene-player--progress-bar/)

    // 2 scenes total (base + 1 override) = 2 segments
    const segments = player.locator('.bc-scene-player__segment')
    await expect(segments).toHaveCount(2)
  })

  test('progress bar shows correct counter', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()
    await page.waitForTimeout(500)

    const counter = page.locator('.bc-frame .bc-scene-player__counter')
    await expect(counter).toHaveText('2/2')

    // Click Scene 1 (base)
    await page.locator('.scene-timeline-item').first().click()
    await page.waitForTimeout(300)
    await expect(counter).toHaveText('1/2')
  })

  test('clicking segment navigates to that scene', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()
    await page.locator('.button-add').click()
    await page.waitForTimeout(500)

    // Currently on Scene 3 (activeIndex=1, second override)
    // Click first segment to go to base
    const segments = page.locator('.bc-frame .bc-scene-player__segment')
    await segments.first().click()
    await page.waitForTimeout(300)

    // Scene 1 (base) should be active in timeline
    await expect(page.locator('.scene-timeline-item').first()).toHaveClass(/scene-timeline-item--active/)
  })

  test('player type can be changed in Layout settings', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()
    await page.waitForTimeout(500)

    // Open Layout tab
    await page.locator('[aria-label="Layout"]').click()
    await page.waitForTimeout(300)

    // Change player type to Dot Stepper
    const playerDropdown = page.locator('.form-control-dropdown', { hasText: 'Scene player' })
    await playerDropdown.locator('.dropdown-toggle').click()
    await page.locator('.form-control-dropdown-item__label', { hasText: 'Dot Stepper' }).click()
    await page.waitForTimeout(300)

    const player = page.locator('.bc-frame [data-scene-player]')
    await expect(player).toHaveClass(/bc-scene-player--dot-stepper/)
  })

  test('player type None hides the player', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()
    await page.waitForTimeout(500)

    // Open Layout tab
    await page.locator('[aria-label="Layout"]').click()
    await page.waitForTimeout(300)

    // Change player type to None
    const playerDropdown = page.locator('.form-control-dropdown', { hasText: 'Scene player' })
    await playerDropdown.locator('.dropdown-toggle').click()
    await page.locator('.form-control-dropdown-item__label', { hasText: 'None' }).click()
    await page.waitForTimeout(300)

    await expect(page.locator('.bc-frame [data-scene-player]')).toHaveCount(0)
  })

  test('player has play button', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()
    await page.waitForTimeout(500)

    const playBtn = page.locator('.bc-frame .bc-scene-player__play-btn')
    await expect(playBtn).toBeVisible()
    await expect(playBtn).toHaveAttribute('aria-label', 'Play')
  })

  test('removing all scenes hides the player', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()
    await page.waitForTimeout(300)
    await expect(page.locator('.bc-frame [data-scene-player]')).toBeVisible()

    // Remove Scene 2
    const scene2 = page.locator('.scene-timeline-item').nth(1)
    await scene2.hover()
    await scene2.locator('.scene-timeline-item__remove').click()
    await page.waitForTimeout(300)

    await expect(page.locator('.bc-frame [data-scene-player]')).toHaveCount(0)
  })

  test('no console errors with scene player', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await goToVisualizeStep(page)

    await page.locator('.button-add').click()
    await page.waitForTimeout(300)

    // Click through segments
    const segments = page.locator('.bc-frame .bc-scene-player__segment')
    await segments.first().click()
    await page.waitForTimeout(200)
    await segments.last().click()
    await page.waitForTimeout(200)

    const realErrors = errors.filter(e => !e.includes('favicon'))
    expect(realErrors).toEqual([])
  })
})
