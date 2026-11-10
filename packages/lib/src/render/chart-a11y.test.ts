import { describe, it, expect } from 'vitest'
import { parseData } from '../charts/parse-data'
import { buildChartAccessibility } from './chart-a11y'
import type { OverlayConfig } from '../charts/types'

const DATA = parseData([
  'series = "GDP per capita","Life expectancy","Population","Continent"',
  '"France" = 44000, 82.3, 68, "Europe"',
  '"Germany" = 50000, 81.0, 84, "Europe"',
  '"Chad" = 1500, 52.8, 18, "Africa"',
  '"Nigeria" = 5000, 53.9, 213, "Africa"',
  '"Japan" = 42000, 84.5, 125, "Asia"',
].join('\n'))

describe('buildChartAccessibility', () => {
  it('summarises a scatter as points', () => {
    expect(buildChartAccessibility('scatter', null, DATA).description).toBe('scatter chart of 5 points.')
  })
  it('uses author alt text instead of the generated description', () => {
    const a11y = buildChartAccessibility('scatter', { title: 'Wealth', description: 'Ignored', altText: '  Rich countries\n live longer.  ' }, DATA)
    expect(a11y).toEqual({ label: 'Wealth', description: 'Rich countries live longer.' })
  })

  it('falls back to the generated description when alt text is blank', () => {
    expect(buildChartAccessibility('scatter', { description: 'Mine', altText: '  ' }, DATA).description).toBe('Mine scatter chart of 5 points.')
  })

  describe('overlays', () => {
    const BAR_DATA = parseData([
      'series = "Sales","Low","High","Target"',
      '"A" = 10, 8, 12, 15',
      '"B" = 20, 18, 22, 25',
    ].join('\n'))
    const OVERLAYS: OverlayConfig[] = [
      { columns: ['Low', 'High'], title: '95% confidence interval' },
      { columns: ['Target'], title: '2022' },
    ]

    it('mentions each overlay by title', () => {
      const a11y = buildChartAccessibility('bar-vertical', null, BAR_DATA, OVERLAYS)
      expect(a11y.description).toBe('bar vertical chart of 2 categories, values from 10 to 20. Includes 95% confidence interval. Includes 2022.')
    })

    it('lets altText win', () => {
      const a11y = buildChartAccessibility('bar-vertical', { altText: 'Sales by year.' }, BAR_DATA, OVERLAYS)
      expect(a11y.description).toBe('Sales by year.')
    })

    it('ignores overlays on other chart types', () => {
      const a11y = buildChartAccessibility('line', null, BAR_DATA, OVERLAYS)
      expect(a11y.description).not.toContain('Includes')
    })

    it('describes the cues', () => {
      const overlays: OverlayConfig[] = [
        { columns: ['Low', 'High'], title: '90% confidence interval', muteIfCrosses: 0 },
        { columns: ['Target'], title: '2% target', aboveColor: '#00ff00' },
      ]
      const a11y = buildChartAccessibility('bar-vertical', null, BAR_DATA, overlays)
      expect(a11y.description).toContain('Faded bars: 90% confidence interval includes 0.')
      expect(a11y.description).toContain('Bars are colored by whether they reach 2% target.')
    })

    it('leaves the cues out when altText is set', () => {
      const overlays: OverlayConfig[] = [
        { columns: ['Low', 'High'], title: '90% confidence interval', muteIfCrosses: 0 },
        { columns: ['Target'], title: '2% target', aboveColor: '#00ff00' },
      ]
      const a11y = buildChartAccessibility('bar-vertical', { altText: 'Mine.' }, BAR_DATA, overlays)
      expect(a11y.description).toBe('Mine.')
    })

    it('summarises the bar series when the overlay names the first column', () => {
      const data = parseData([
        'series = "Low","V","High"',
        '"A" = 8, 10, 12',
        '"B" = 18, 20, 22',
      ].join('\n'))
      const overlays: OverlayConfig[] = [{ columns: ['Low', 'High'], title: 'Band' }]
      const a11y = buildChartAccessibility('bar-vertical', null, data, overlays)
      expect(a11y.description).toBe('bar vertical chart of 2 categories, values from 10 to 20. Includes Band.')
    })
  })
})
