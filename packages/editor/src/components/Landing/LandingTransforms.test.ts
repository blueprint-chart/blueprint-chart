import { mount } from '@vue/test-utils'
import LandingTransforms from './LandingTransforms.vue'

function mountTransforms() {
  return mount(LandingTransforms, {
    global: {
      stubs: {
        LandingSection: { template: '<section :id="id"><slot /></section>', props: ['id'] },
        LandingSectionHeader: {
          template: '<header><div class="header-label">{{ label }}</div><slot /><slot name="lead" /></header>',
          props: ['label'],
        },
        LandingDefaultCard: {
          template: '<div class="default-card-stub" :data-title="title" :data-tag="tag" />',
          props: ['icon', 'tag', 'title', 'description'],
        },
      },
    },
  })
}

describe('LandingTransforms', () => {
  it('mounts at the transforms anchor', () => {
    const w = mountTransforms()
    expect(w.find('section').attributes('id')).toBe('transforms')
  })

  it('renders the mono eyebrow', () => {
    const w = mountTransforms()
    expect(w.find('.header-label').text()).toBe('03 / Data pipeline')
  })

  it('renders 4 grouped capability cards', () => {
    const w = mountTransforms()
    const cards = w.findAll('.default-card-stub')
    expect(cards).toHaveLength(4)
    const titles = cards.map(n => n.attributes('data-title'))
    expect(titles).toEqual([
      'Core operations',
      'Parse & reshape',
      'Chart-ready labels',
      'Pivot',
    ])
  })

  it('attaches the expected mono tags to each card', () => {
    const w = mountTransforms()
    const tags = w.findAll('.default-card-stub').map(n => n.attributes('data-tag'))
    expect(tags).toEqual([
      'SORT · FILTER · GROUP',
      '29 OPERATIONS',
      'RENAME · HIDE',
      'TRANSPOSE',
    ])
  })

  it('keeps the 4 demo step buttons', () => {
    const w = mountTransforms()
    expect(w.findAll('.transforms-demo__step')).toHaveLength(4)
  })
})
