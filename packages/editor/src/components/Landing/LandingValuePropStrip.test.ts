import { mount } from '@vue/test-utils'
import LandingValuePropStrip from './LandingValuePropStrip.vue'

const GITHUB_URL = 'https://github.com/blueprint-chart/blueprint-chart'

describe('LandingValuePropStrip', () => {
  it('renders the four expected labels', () => {
    const wrapper = mount(LandingValuePropStrip)
    const labels = wrapper.findAll('.landing-value-prop-strip__cell__label').map(n => n.text())
    expect(labels).toEqual([
      '01 / Plain text',
      '02 / No backend',
      '03 / Data sovereignty',
      '04 / MIT',
    ])
  })

  it('renders the four expected values', () => {
    const wrapper = mount(LandingValuePropStrip)
    const values = wrapper.findAll('.landing-value-prop-strip__cell__value').map(n => n.text().trim())
    expect(values).toEqual([
      'A format AI can write',
      'Renders in the browser',
      'Nothing ever uploaded',
      'Open source, forever',
    ])
  })

  it('links the MIT cell to the GitHub repository', () => {
    const wrapper = mount(LandingValuePropStrip)
    const link = wrapper.find(`a[href="${GITHUB_URL}"]`)
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Open source')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })
})
