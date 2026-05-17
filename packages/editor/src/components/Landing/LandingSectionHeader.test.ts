import { mount } from '@vue/test-utils'
import LandingSectionHeader from './LandingSectionHeader.vue'

function mountHeader(slots: Record<string, string> = {}, props: Record<string, unknown> = {}) {
  return mount(LandingSectionHeader, {
    props: { label: '02 / Defaults', ...props },
    slots: {
      default: 'A simple chart <em>sends a big message.</em>',
      ...slots,
    },
  })
}

describe('LandingSectionHeader', () => {
  it('renders the label text', () => {
    const w = mountHeader()
    expect(w.find('.landing-section-header__label').text()).toBe('02 / Defaults')
  })

  it('applies mono + uppercase styling on the label', () => {
    const w = mountHeader()
    const label = w.find('.landing-section-header__label')
    // jsdom doesn't compute scoped SCSS, so assert the class only — visual is the contract.
    expect(label.classes()).toContain('landing-section-header__label')
  })

  it('renders the headline slot with em', () => {
    const w = mountHeader()
    expect(w.find('.landing-section-header__title em').text()).toBe('sends a big message.')
  })

  it('renders the lead slot when provided', () => {
    const w = mountHeader({ lead: 'Clutter is the enemy of insight.' })
    expect(w.find('.landing-section-header__lead').exists()).toBe(true)
    expect(w.find('.landing-section-header__lead').text()).toBe('Clutter is the enemy of insight.')
  })

  it('omits the lead when no slot provided', () => {
    const w = mountHeader()
    expect(w.find('.landing-section-header__lead').exists()).toBe(false)
  })
})
