import { mount } from '@vue/test-utils'
import BcRing from './BcRing.vue'

describe('BcRing', () => {
  it('renders slotted content above a stippled gradient stroke', () => {
    const w = mount(BcRing, { slots: { default: '<div class="card">hi</div>' } })
    expect(w.find('.card').exists()).toBe(true)
    const rect = w.find('svg rect')
    expect(rect.exists()).toBe(true)
    expect(rect.attributes('fill')).toBe('none')
    expect(rect.attributes('stroke')).toMatch(/^url\(#/)
    expect(rect.attributes('filter')).toBe('url(#bc-stipple-a)')
  })

  it('is decorative: the svg is aria-hidden', () => {
    const w = mount(BcRing, { slots: { default: '<div>x</div>' } })
    expect(w.find('svg').attributes('aria-hidden')).toBe('true')
  })

  it('uses the field gradient by default and the paper gradient when tone=paper', () => {
    const field = mount(BcRing, { slots: { default: '<i/>' } })
    const paper = mount(BcRing, { props: { tone: 'paper' }, slots: { default: '<i/>' } })
    const fieldId = field.find('svg rect').attributes('stroke')
    const paperId = paper.find('svg rect').attributes('stroke')
    expect(fieldId).not.toBe(paperId)
  })
})
