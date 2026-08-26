import { test, expect } from '@playwright/test'
import { gotoRender } from '../support/render'

/** Standard RFC 4648 base64, exactly as a naive hand-built URL would carry it. */
function b64(input: string): string {
  return Buffer.from(input, 'utf-8').toString('base64')
}

function urlSafeB64(input: string): string {
  return b64(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// The subscript 2 is what puts a `+` in the payload; without it the same chart
// encodes to an alphabet the address bar never mangles.
const CO2_BPC = `chart bar-vertical {
  title = "CO₂"

  data {
    "A" = 1
    "B" = 2
  }
}
`

const NOTE_BPC = `chart bar-vertical {
  title = "Polls"
  note = "Margin of error: +/- 3 points"

  data {
    "A" = 1
    "B" = 2
  }
}
`

const NO_PLAYER_BPC = `chart bar-vertical {
  title = "Two scenes, no player"
  player = none

  data {
    "A" = 1
    "B" = 2
  }

  scene "Second" {
    data {
      "A" = 3
      "B" = 4
    }
  }
}
`

const SEED_BPC = `chart bar-vertical {
  title = "Seed"

  data {
    "A" = 10
    "B" = 20
    "C" = 30
  }
}
`

test.describe('G18 editor state, persistence and routing', () => {
  // #10: the payload travels through vue-router's query parser, which turns an
  // unencoded `+` into a space.
  test('/render decodes a payload whose base64 contains a plus', async ({ page }) => {
    const payload = b64(CO2_BPC)
    expect(payload).toContain('+')

    await page.goto(`/#/render?bpc64=${payload}`)
    await expect(page.locator('.bc-frame')).toBeVisible()
    await expect(page.locator('.bc-frame')).toContainText('CO₂')
  })

  // #10: /copy accepts the URL-safe alphabet, so the published /render URL for
  // the same chart has to as well.
  test('/render accepts the same URL-safe base64 /copy accepts', async ({ page }) => {
    await page.goto(`/#/render?bpc64=${urlSafeB64(CO2_BPC)}`)
    await expect(page.locator('.bc-frame')).toBeVisible()
    await expect(page.locator('.bc-frame')).toContainText('CO₂')
  })

  // #10: a payload that cannot be decoded at all must say so.
  test('/render reports a broken payload instead of an empty chart', async ({ page }) => {
    await page.goto('/#/render?bpc64=not!base64@@')
    await expect(page.locator('.render-page__error')).toBeVisible()
    await expect(page.locator('.render-page')).not.toContainText('No data to preview')
  })

  // #117: the landing page for every stale bookmark.
  test('an unknown chart id offers a way back to My Charts', async ({ page }) => {
    await page.goto('/#/render?id=NOSUCHID999')
    await expect(page.locator('.render-page__error')).toBeVisible()
    await expect(page.locator('.render-page')).not.toContainText('No data to preview')
    await page.locator('.render-page__error a').click()
    await expect(page).toHaveURL(/#\/charts$/)
  })

  // #32: note is a frame property everywhere except the editor's DSL sync.
  test('note reaches the rendered frame', async ({ page }) => {
    await gotoRender(page, NOTE_BPC)
    await expect(page.locator('.bc-frame-note')).toBeVisible()
    await expect(page.locator('.bc-frame-note')).toContainText('Margin of error')
  })

  // #56: the editor preview honours player = none, so the published render must.
  test('player = none hides the player on /render', async ({ page }) => {
    await gotoRender(page, NO_PLAYER_BPC)
    await expect(page.locator('.bc-frame')).toBeVisible()
    await expect(page.locator('[data-scene-player]')).toHaveCount(0)
  })

  // #118: the address bar walks the steps, so Back has to walk them too.
  test('browser Back steps back through the wizard', async ({ page }) => {
    await page.goto(`/#/copy?bpc64=${urlSafeB64(SEED_BPC)}`)
    await page.waitForURL(/#\/edit\/[a-zA-Z0-9]{11}\/visualize$/)

    await page.getByRole('tab', { name: 'Data' }).click()
    await page.waitForURL(/#\/edit\/[a-zA-Z0-9]{11}\/data$/)
    await page.getByRole('tab', { name: 'Export' }).click()
    await page.waitForURL(/#\/edit\/[a-zA-Z0-9]{11}\/export$/)

    await page.goBack()
    await expect(page).toHaveURL(/#\/edit\/[a-zA-Z0-9]{11}\/data$/)
    await page.goBack()
    await expect(page).toHaveURL(/#\/edit\/[a-zA-Z0-9]{11}\/visualize$/)
  })

  // #70: Replace data reported "saved just now" over data that never reached
  // storage, so a reload reverted it.
  test('Replace data survives a reload without visiting Visualize', async ({ page }) => {
    await page.goto(`/#/copy?bpc64=${urlSafeB64(SEED_BPC)}`)
    await page.waitForURL(/#\/edit\/[a-zA-Z0-9]{11}\/visualize$/)
    const id = page.url().match(/#\/edit\/([a-zA-Z0-9]{11})\//)![1]

    await page.getByRole('tab', { name: 'Data' }).click()
    await page.waitForURL(/#\/edit\/[a-zA-Z0-9]{11}\/data$/)
    await page.getByRole('button', { name: 'Replace data' }).click()

    await page.locator('.upload-card__paste__wrap__area').fill('Label\tValue\nX\t1\nY\t2\nZ\t3\nW\t4')
    await page.getByRole('button', { name: 'Load data' }).click()

    await expect.poll(
      () => page.evaluate(key => localStorage.getItem(key) ?? '', `blueprint-chart:${id}`),
      { timeout: 10_000 },
    ).toContain('"X" = 1')

    await page.reload()
    await page.waitForURL(/#\/edit\/[a-zA-Z0-9]{11}\/data$/)
    await expect(page.locator('.data-check-table')).toContainText('X')
    await expect(page.locator('.data-check-table tbody tr')).toHaveCount(4)
  })
})
