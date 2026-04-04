import { mount } from '@vue/test-utils'
import LandingPractices from './LandingPractices.vue'

vi.mock('~icons/ph/arrow-line-down', () => ({ default: { render: () => null } }))
vi.mock('~icons/ph/palette', () => ({ default: { render: () => null } }))
vi.mock('~icons/ph/devices', () => ({ default: { render: () => null } }))
vi.mock('~icons/ph/text-aa', () => ({ default: { render: () => null } }))
vi.mock('~icons/ph/quotes', () => ({ default: { render: () => null } }))
vi.mock('~icons/ph/chart-bar', () => ({ default: { render: () => null } }))

describe('LandingPractices', () => {
  it('renders 6 practice cards', () => {
    const w = mount(LandingPractices, {
      global: {
        stubs: {
          LandingSection: { template: '<div><slot /></div>' },
          LandingSectionHeader: { template: '<div><slot /></div>' },
          AppIcon: { template: '<span />', props: ['name', 'size', 'variant'] },
        },
      },
    })
    const cards = w.findAll('.practice-card')
    expect(cards).toHaveLength(6)
  })
})
