import { mount } from '@vue/test-utils'
import LandingValuePropStrip from './LandingValuePropStrip.vue'

function mountStrip() {
  return mount(LandingValuePropStrip)
}

describe('LandingValuePropStrip', () => {
  it('renders 4 cells', () => {
    const w = mountStrip()
    expect(w.findAll('.landing-value-prop-strip__cell')).toHaveLength(4)
  })

  it('renders the four expected labels', () => {
    const w = mountStrip()
    const labels = w.findAll('.landing-value-prop-strip__cell__label').map(n => n.text())
    expect(labels).toEqual([
      '01 / Plain text',
      '02 / No backend',
      '03 / Data sovereignty',
      '04 / MIT',
    ])
  })

  it('renders the four expected values', () => {
    const w = mountStrip()
    const values = w.findAll('.landing-value-prop-strip__cell__value').map(n => n.text())
    expect(values).toEqual([
      'A format AI can write',
      'Renders in the browser',
      'Nothing ever uploaded',
      'Open source, forever',
    ])
  })
})
