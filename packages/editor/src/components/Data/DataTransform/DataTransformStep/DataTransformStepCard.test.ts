import { mount } from '@vue/test-utils'
import DataTransformStepCard from './DataTransformStepCard.vue'
import { TransformType } from '@/enums'

function mountCard(active: boolean) {
  return mount(DataTransformStepCard, {
    props: { step: { type: TransformType.Sort, config: { column: 'a' } } as never, index: 0, active },
    slots: { default: '<div class="cfg">cfg</div>' },
  })
}

describe('DataTransformStepCard', () => {
  it.each([true, false])('header is a button with aria-expanded=%s', (active) => {
    const header = mountCard(active).find('button.step-card__header')
    expect(header.attributes('type')).toBe('button')
    expect(header.attributes('aria-expanded')).toBe(String(active))
  })

  it('emits select when the header button is clicked', async () => {
    const w = mountCard(false)
    await w.find('button.step-card__header').trigger('click')
    expect(w.emitted('select')).toHaveLength(1)
  })

  it('emits delete without select', async () => {
    const w = mountCard(false)
    await w.find('button[aria-label="Remove step"]').trigger('click')
    expect(w.emitted('delete')).toHaveLength(1)
    expect(w.emitted('select')).toBeUndefined()
  })
})
