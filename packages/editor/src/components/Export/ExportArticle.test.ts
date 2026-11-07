import { mount } from '@vue/test-utils'
import ExportArticle from './ExportArticle.vue'

const isNarrow = vi.hoisted(() => ({ value: false }))

vi.mock('@blueprint-chart/ui', async importOriginal => ({
  ...await importOriginal<typeof import('@blueprint-chart/ui')>(),
  useBreakpoint: () => ({ isNarrow: ref(isNarrow.value) }),
}))

const slot = { default: '<div class="probe" />' }

function columnChildren(wrapper: ReturnType<typeof mount>) {
  return Array.from(wrapper.get('.export-article__column').element.children)
}

describe('ExportArticle', () => {
  afterEach(() => {
    isNarrow.value = false
  })

  it('frames the slot in a page with a site header', () => {
    const w = mount(ExportArticle, { slots: slot })
    expect(w.find('.export-article__masthead').exists()).toBe(true)
    expect(w.find('.export-article__column .probe').exists()).toBe(true)
  })

  it('renders a headline and a byline above the slot', () => {
    const w = mount(ExportArticle, { slots: slot })
    expect(w.get('.export-article__column__header__headline').text()).not.toBe('')
    expect(w.get('.export-article__column__header__byline').text()).not.toBe('')
  })

  it('renders the header right before the slot', () => {
    const w = mount(ExportArticle, { slots: slot })
    const children = columnChildren(w)
    const probeIndex = children.findIndex(el => el.classList.contains('probe'))
    expect(children[probeIndex - 1].classList).toContain('export-article__column__header')
  })

  it('renders body paragraphs after the slot', () => {
    const w = mount(ExportArticle, { slots: slot })
    const children = columnChildren(w)
    const probeIndex = children.findIndex(el => el.classList.contains('probe'))
    const after = children.slice(probeIndex + 1)
    expect(after.length).toBeGreaterThan(0)
    expect(after.every(el => el.classList.contains('export-article__column__paragraph'))).toBe(true)
  })

  it('hides the placeholder content from assistive technologies', () => {
    const w = mount(ExportArticle, { slots: slot })
    expect(w.get('.export-article__masthead').attributes('aria-hidden')).toBe('true')
    expect(w.get('.export-article__column__header').attributes('aria-hidden')).toBe('true')
    w.findAll('.export-article__column__paragraph').forEach((paragraph) => {
      expect(paragraph.attributes('aria-hidden')).toBe('true')
    })
  })

  it('renders only the slot when bare', () => {
    const w = mount(ExportArticle, { props: { bare: true }, slots: slot })
    expect(w.find('.probe').exists()).toBe(true)
    expect(w.find('.export-article__masthead').exists()).toBe(false)
    expect(w.find('.export-article__column__header').exists()).toBe(false)
    expect(w.find('.export-article__column__paragraph').exists()).toBe(false)
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

  it('runs edge to edge without a masthead on narrow screens', () => {
    isNarrow.value = true
    const w = mount(ExportArticle, { slots: slot })
    expect(w.classes()).toContain('export-article--narrow')
    expect(w.find('.export-article__masthead').exists()).toBe(false)
  })

  it('keeps the masthead on wide screens', () => {
    const w = mount(ExportArticle, { slots: slot })
    expect(w.classes()).not.toContain('export-article--narrow')
    expect(w.find('.export-article__masthead').exists()).toBe(true)
  })
})
