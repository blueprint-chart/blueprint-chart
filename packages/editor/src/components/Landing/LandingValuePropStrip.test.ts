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
      '01 / No backend',
      '02 / Self-contained',
      '03 / Data sovereignty',
      '04 / MIT',
    ])
  })

  it('renders the four expected values', () => {
    const w = mountStrip()
    const values = w.findAll('.landing-value-prop-strip__cell__value').map(n => n.text())
    expect(values).toEqual([
      'Runs in the browser',
      'One portable iframe',
      'Nothing ever uploaded',
      'Free, open source, forever',
    ])
  })
})
