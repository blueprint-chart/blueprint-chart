import { mount } from '@vue/test-utils'
import PalettesCard from './PalettesCard.vue'

function mountCard(props: { label?: string, colors?: string[], editable?: boolean } = {}) {
  return mount(PalettesCard, {
    props: { label: 'Test', colors: ['#dd5129', '#0f7ba2'], editable: false, selected: false, ...props },
  })
}

const buttonLabels = (wrapper: ReturnType<typeof mountCard>) =>
  wrapper.findAll('button').map(b => b.attributes('aria-label') ?? '')

describe('PalettesCard', () => {
  it('renders one swatch per color', () => {
    const wrapper = mountCard({ colors: ['#dd5129', '#0f7ba2', '#43b284'] })
    expect(wrapper.findAll('.palettes-swatch-strip__segment')).toHaveLength(3)
  })

  it('shows only Duplicate when not editable', () => {
    const texts = buttonLabels(mountCard({ editable: false }))
    expect(texts.some(t => t.includes('Duplicate'))).toBe(true)
    expect(texts.some(t => t.includes('Edit'))).toBe(false)
    expect(texts.some(t => t.includes('Delete'))).toBe(false)
  })

  it('emits duplicate when Duplicate is clicked', async () => {
    const wrapper = mountCard()
    await wrapper.findAll('button').find(b => b.attributes('aria-label') === 'Duplicate')!.trigger('click')
    expect(wrapper.emitted('duplicate')).toHaveLength(1)
  })

  it('shows a failing light contrast level for near-white colors', () => {
    const wrapper = mountCard({ colors: ['#ffffff', '#fefefe'] })
    expect(wrapper.find('.palettes-card-chips__light .palettes-card-chip__dot--fail').exists()).toBe(true)
  })
})
