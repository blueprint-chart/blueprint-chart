import { layoutDefaults } from '@/composables/useChartConfig'
import { fitCard, thumbnailWidth } from './chartThumbnailFit'

describe('fitCard', () => {
  it('fits a wide card by width and centers it', () => {
    expect(fitCard({ width: 300, height: 200 }, { width: 600, height: 400 }, 10)).toEqual({ scale: 0.45, x: 15, y: 10 })
  })

  it('fits a tall card by height', () => {
    expect(fitCard({ width: 300, height: 200 }, { width: 600, height: 1200 }, 10).scale).toBe(0.15)
  })

  it('never upscales', () => {
    expect(fitCard({ width: 2000, height: 2000 }, { width: 600, height: 400 }, 10).scale).toBe(1)
  })

  it('returns scale 0 for a zero-size box', () => {
    expect(fitCard({ width: 0, height: 0 }, { width: 600, height: 400 }, 10)).toEqual({ scale: 0, x: 0, y: 0 })
  })
})

describe('thumbnailWidth', () => {
  it('uses the fixed width', () => {
    expect(thumbnailWidth({ ...layoutDefaults, sizing: 'fixed', fixedWidth: 480 })).toBe(480)
  })

  it('uses the max width', () => {
    expect(thumbnailWidth({ ...layoutDefaults, sizing: 'max-width', maxWidth: 660 })).toBe(660)
  })

  it('uses the responsive width', () => {
    expect(thumbnailWidth({ ...layoutDefaults, sizing: 'responsive' })).toBe(640)
  })
})
