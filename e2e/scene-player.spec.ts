import { test, expect } from '@playwright/test'

async function goToVisualizeStep(page) {
  await page.goto('/#/new')

  const textarea = page.locator('textarea')
  await textarea.fill('Label,Value\nA,10\nB,20\nC,30')
  await page.locator('button', { hasText: 'Load data' }).click()

  await page.locator('.navigation-stepper-chevron__step', { hasText: 'Visualize' }).click()
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

    const player = page.locator('.bc-frame [data-scene-player]')
    await expect(player).toBeVisible()
  })

  test('default player is buttons', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()

    const player = page.locator('.bc-frame [data-scene-player]')
    await expect(player).toHaveClass(/bc-scene-player--buttons/)
  })

  test('buttons player shows correct counter', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()

    const counter = page.locator('.bc-frame .bc-scene-player__counter')
    await expect(counter).toHaveText('2 / 2')

    // Click Scene 1 (base)
    await page.locator('.scene-timeline-item').first().click()
    await expect(counter).toHaveText('1 / 2')
  })

  test('arrow buttons navigate between scenes', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()
    await page.locator('.button-add').click()

    // Currently on Scene 3 (last added) — click prev arrow to go back
    const prevBtn = page.locator('.bc-frame [aria-label="Previous scene"]')
    await prevBtn.click()

    // Scene 2 should be active in timeline
    await expect(page.locator('.scene-timeline-item').nth(1)).toHaveClass(/scene-timeline-item--active/)
  })

  test('player type can be changed in Interactions settings', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()

    // Open Interactions tab
    await page.locator('[aria-label="Interactions"]').click()

    // Change player type to Dot Stepper
    const playerDropdown = page.locator('.form-control-dropdown', { hasText: 'Scene player' })
    await playerDropdown.locator('.dropdown-toggle').click()
    await page.locator('.form-control-dropdown-item__content__text__label', { hasText: 'Dot Stepper' }).click()

    const player = page.locator('.bc-frame [data-scene-player]')
    await expect(player).toHaveClass(/bc-scene-player--dot-stepper/)
  })

  test('player type None hides the player', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()

    // Open Interactions tab
    await page.locator('[aria-label="Interactions"]').click()

    // Change player type to None
    const playerDropdown = page.locator('.form-control-dropdown', { hasText: 'Scene player' })
    await playerDropdown.locator('.dropdown-toggle').click()
    await page.locator('.dropdown-menu.show .form-control-dropdown-item__content__text__label', { hasText: 'None' }).click()

    await expect(page.locator('.bc-frame [data-scene-player]')).toHaveCount(0)
  })

  test('minimal-arrows player has play button', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()

    // Change player type to Minimal Arrows
    await page.locator('[aria-label="Interactions"]').click()
    const playerDropdown = page.locator('.form-control-dropdown', { hasText: 'Scene player' })
    await playerDropdown.locator('.dropdown-toggle').click()
    await page.locator('.form-control-dropdown-item__content__text__label', { hasText: 'Minimal Arrows' }).click()

    const playBtn = page.locator('.bc-frame .bc-scene-player__play-btn')
    await expect(playBtn).toBeVisible()
    await expect(playBtn).toHaveAttribute('aria-label', 'Play')
  })

  test('removing all scenes hides the player', async ({ page }) => {
    await goToVisualizeStep(page)

    await page.locator('.button-add').click()
    await expect(page.locator('.bc-frame [data-scene-player]')).toBeVisible()

    // Remove Scene 2
    const scene2 = page.locator('.scene-timeline-item').nth(1)
    await scene2.hover()
    await scene2.locator('.scene-timeline-item__remove').click()

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
    await expect(page.locator('.scene-timeline-item')).toHaveCount(2)

    // Navigate with arrow buttons
    const prevBtn = page.locator('.bc-frame [aria-label="Previous scene"]')
    const nextBtn = page.locator('.bc-frame [aria-label="Next scene"]')
    if (await prevBtn.isVisible()) {
      await prevBtn.click()
    }
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
    }

    const realErrors = errors.filter(e => !e.includes('favicon'))
    expect(realErrors).toEqual([])
  })
})
