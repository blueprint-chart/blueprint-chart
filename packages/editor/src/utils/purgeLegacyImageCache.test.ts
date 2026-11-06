import { purgeLegacyImageCache } from './purgeLegacyImageCache'

describe('purgeLegacyImageCache', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('removes thumbnail and preview keys and keeps everything else', () => {
    const keys = [
      'blueprint-chart:abc',
      'blueprint-chart:abc:meta',
      'blueprint-chart:abc:thumbnail',
      'blueprint-chart:abc:thumbnail:dark',
      'blueprint-chart:abc:preview:light',
      'blueprint-chart:palettes',
    ]
    keys.forEach(key => localStorage.setItem(key, 'x'))

    purgeLegacyImageCache()

    const remaining = Object.keys(localStorage).sort()
    expect(remaining).toEqual(['blueprint-chart:abc', 'blueprint-chart:abc:meta', 'blueprint-chart:palettes'])
  })
})
