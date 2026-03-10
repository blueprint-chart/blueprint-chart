import { test, expect, type Page } from '@playwright/test'

/**
 * Frame padding regression tests.
 *
 * Verifies that frame padding is applied only once (on the frame sections)
 * and not doubled by an outer card/container wrapper.
 */

function bpc64(bpc: string): string {
  return Buffer.from(bpc).toString('base64')
}

async function gotoChart(page: Page, bpc: string) {
  await page.goto(`/#/render?bpc64=${bpc64(bpc)}`)
  await page.waitForSelector('.bc-frame', { timeout: 10_000 })
}

const PADDED_CHART = `chart bar-vertical {
  title = "Padding Test"
  description = "Testing no double padding"
  byline = "Author"
  source = "Data Source"
  padding = 20

  data {
    "A" = 10
    "B" = 20
  }
}`

const PADDED_FRAMED_CHART = `chart bar-vertical {
  title = "Framed Padding Test"
  description = "Testing no double padding with theme"
  byline = "Author"
  source = "Data Source"
  theme = "blueprint-framed"
  padding = 20

  data {
    "A" = 10
    "B" = 20
  }
}`

test.describe('frame padding', () => {
  test('card wrapper has zero padding when frame sections handle padding', async ({ page }) => {
    await gotoChart(page, PADDED_CHART)

    const cardPadding = await page.locator('.render-page__card').evaluate(
      el => getComputedStyle(el).padding,
    )
    expect(cardPadding).toBe('0px')
  })

  test('header left padding equals --bc-frame-padding', async ({ page }) => {
    await gotoChart(page, PADDED_CHART)

    const result = await page.locator('.bc-frame').evaluate((frame) => {
      const header = frame.querySelector('.bc-frame-header') as HTMLElement
      const framePadding = getComputedStyle(frame).getPropertyValue('--bc-frame-padding').trim()
      const headerPaddingLeft = getComputedStyle(header).paddingLeft
      return { framePadding, headerPaddingLeft }
    })

    expect(result.headerPaddingLeft).toBe(result.framePadding)
  })

  test('footer bottom padding equals --bc-frame-padding', async ({ page }) => {
    await gotoChart(page, PADDED_CHART)

    const result = await page.locator('.bc-frame').evaluate((frame) => {
      const footer = frame.querySelector('.bc-frame-footer') as HTMLElement
      const framePadding = getComputedStyle(frame).getPropertyValue('--bc-frame-padding').trim()
      const footerPaddingBottom = getComputedStyle(footer).paddingBottom
      return { framePadding, footerPaddingBottom }
    })

    expect(result.footerPaddingBottom).toBe(result.framePadding)
  })

  test('body side padding equals --bc-frame-padding, no top/bottom', async ({ page }) => {
    await gotoChart(page, PADDED_CHART)

    const result = await page.locator('.bc-frame').evaluate((frame) => {
      const body = frame.querySelector('.bc-frame-body') as HTMLElement
      const framePadding = getComputedStyle(frame).getPropertyValue('--bc-frame-padding').trim()
      const cs = getComputedStyle(body)
      return {
        framePadding,
        paddingTop: cs.paddingTop,
        paddingRight: cs.paddingRight,
        paddingBottom: cs.paddingBottom,
        paddingLeft: cs.paddingLeft,
      }
    })

    expect(result.paddingTop).toBe('0px')
    expect(result.paddingRight).toBe(result.framePadding)
    expect(result.paddingBottom).toBe('0px')
    expect(result.paddingLeft).toBe(result.framePadding)
  })

  test('framed theme: header left offset equals body left offset', async ({ page }) => {
    await gotoChart(page, PADDED_FRAMED_CHART)

    const result = await page.locator('.bc-frame').evaluate((frame) => {
      const header = frame.querySelector('.bc-frame-header') as HTMLElement
      const body = frame.querySelector('.bc-frame-body') as HTMLElement
      const headerRect = header.getBoundingClientRect()
      const bodyRect = body.getBoundingClientRect()
      const frameRect = frame.getBoundingClientRect()
      return {
        headerLeftOffset: headerRect.left - frameRect.left,
        bodyContentLeftOffset: bodyRect.left - frameRect.left,
      }
    })

    // Header background extends to frame edge (0), body content is padded
    expect(result.headerLeftOffset).toBe(0)
  })

  test('framed theme: footer background extends to frame edge', async ({ page }) => {
    await gotoChart(page, PADDED_FRAMED_CHART)

    const result = await page.locator('.bc-frame').evaluate((frame) => {
      const footer = frame.querySelector('.bc-frame-footer') as HTMLElement
      const frameRect = frame.getBoundingClientRect()
      const footerRect = footer.getBoundingClientRect()
      return {
        footerLeftOffset: footerRect.left - frameRect.left,
        footerRightOffset: frameRect.right - footerRect.right,
      }
    })

    expect(result.footerLeftOffset).toBe(0)
    expect(result.footerRightOffset).toBe(0)
  })
})

test.describe('theme in BPC', () => {
  test('render route applies theme class from BPC', async ({ page }) => {
    await gotoChart(page, PADDED_FRAMED_CHART)

    const hasThemeClass = await page.locator('.bc-frame').evaluate(
      el => el.classList.contains('bc-theme-blueprint-framed'),
    )
    expect(hasThemeClass).toBe(true)
  })

  test('framed theme renders footer background color', async ({ page }) => {
    await gotoChart(page, PADDED_FRAMED_CHART)

    const footerBg = await page.locator('.bc-frame-footer').evaluate(
      el => getComputedStyle(el).backgroundColor,
    )
    // #f8f8f8 = rgb(248, 248, 248)
    expect(footerBg).toBe('rgb(248, 248, 248)')
  })

  test('framed theme dark mode: footer background adapts', async ({ page }) => {
    await gotoChart(page, PADDED_FRAMED_CHART)
    await page.evaluate(() => document.documentElement.setAttribute('data-bs-theme', 'dark'))

    const footerBg = await page.locator('.bc-frame-footer').evaluate(
      el => getComputedStyle(el).backgroundColor,
    )
    // #1c1c20 = rgb(28, 28, 32)
    expect(footerBg).toBe('rgb(28, 28, 32)')
  })

  test('framed theme dark mode: header border adapts', async ({ page }) => {
    await gotoChart(page, PADDED_FRAMED_CHART)
    await page.evaluate(() => document.documentElement.setAttribute('data-bs-theme', 'dark'))

    const borderBottom = await page.locator('.bc-frame-header').evaluate(
      el => getComputedStyle(el).borderBottom,
    )
    expect(borderBottom).toBe('1px solid rgb(51, 51, 51)')
  })
})

test.describe('editor card padding', () => {
  test('editor card has zero padding (frame sections handle it)', async ({ page }) => {
    // Load a sample chart via the samples flow
    await page.goto('/#/new')
    await page.getByRole('button', { name: 'Samples' }).click()
    await page.getByRole('button', { name: 'E is the most frequent letter' }).click()
    await page.waitForSelector('.bc-frame', { timeout: 10_000 })

    const cardPadding = await page.locator('.chart-edit-panel__card').evaluate(
      el => getComputedStyle(el).padding,
    )
    expect(cardPadding).toBe('0px')
  })
})
