import { mount } from '@vue/test-utils'
import ExportArticle from './ExportArticle.vue'

const slot = { default: '<div class="probe" />' }

describe('ExportArticle', () => {
  it('wraps the slot with skeleton bars', () => {
    const w = mount(ExportArticle, { slots: slot })
    expect(w.find('.probe').exists()).toBe(true)
    expect(w.findAll('.feedback-skeleton').length).toBeGreaterThan(0)
    expect(w.findAll('.export-article__paragraph').length).toBe(3)
  })

  it('renders only the slot when bare', () => {
    const w = mount(ExportArticle, { props: { bare: true }, slots: slot })
    expect(w.find('.probe').exists()).toBe(true)
    expect(w.find('.feedback-skeleton').exists()).toBe(false)
    expect(w.classes()).toContain('export-article--bare')
  })

  it('keeps the slot element across toggles', async () => {
    const w = mount(ExportArticle, { slots: slot })
    const before = w.find('.probe').element
    await w.setProps({ bare: true })
    await w.setProps({ bare: false })
    expect(w.find('.probe').element).toBe(before)
  })

  it('does not animate the skeleton bars', () => {
    const w = mount(ExportArticle, { slots: slot })
    expect(w.find('.feedback-skeleton--animated').exists()).toBe(false)
  })
})
