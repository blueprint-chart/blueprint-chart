import { mount } from '@vue/test-utils'
import StippleDefs from './StippleDefs.vue'

describe('StippleDefs', () => {
  it('renders three stipple filters with distinct seeds', () => {
    const w = mount(StippleDefs)
    expect(w.find('filter#bc-stipple-a').exists()).toBe(true)
    expect(w.find('filter#bc-stipple-b').exists()).toBe(true)
    expect(w.find('filter#bc-stipple-c').exists()).toBe(true)
    const seeds = w.findAll('feTurbulence').map(n => n.attributes('seed'))
    expect(new Set(seeds).size).toBe(3)
  })

  it('uses the FIG.05 filter chain (turbulence to alpha to composite-in)', () => {
    const w = mount(StippleDefs)
    expect(w.find('feTurbulence[type="fractalNoise"]').exists()).toBe(true)
    expect(w.find('feColorMatrix[type="luminanceToAlpha"]').exists()).toBe(true)
    expect(w.find('feComposite[operator="in"]').exists()).toBe(true)
  })

  it('is visually hidden (zero-size, aria-hidden)', () => {
    const w = mount(StippleDefs)
    const svg = w.find('svg')
    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.attributes('width')).toBe('0')
    expect(svg.attributes('height')).toBe('0')
  })

  it('renders feTurbulence with camelCase SVG attributes so the browser applies them', () => {
    const w = mount(StippleDefs)
    const turbulence = w.find('filter#bc-stipple-a feTurbulence')
    expect(turbulence.attributes('baseFrequency')).toBe('0.65')
    expect(turbulence.attributes('numOctaves')).toBe('3')
    expect(turbulence.attributes('stitchTiles')).toBe('stitch')
  })
})
