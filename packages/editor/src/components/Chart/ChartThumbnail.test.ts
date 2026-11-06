import { flushPromises, mount } from '@vue/test-utils'
import { renderChart } from '@blueprint-chart/lib'
import { useThemeStore } from '@/stores/theme'
import ChartThumbnail from './ChartThumbnail.vue'

vi.mock('@blueprint-chart/lib', async (orig) => {
  const lib = await orig<typeof import('@blueprint-chart/lib')>()
  return { ...lib, renderChart: vi.fn(lib.renderChart) }
})

const chart = (body: string, data = '"A" = 1\n    "B" = 2') => `chart bar-vertical {
  title = "Thumb title"
  ${body}
  data {
    ${data}
  }
}`

function stubIntersectionObserver(intersecting: boolean) {
  vi.stubGlobal('IntersectionObserver', class {
    constructor(private callback: IntersectionObserverCallback) {}
    observe(target: Element) {
      if (intersecting) {
        this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
      }
    }

    unobserve() {}
    disconnect() {}
  })
}

function mountThumbnail(dsl: string) {
  return mount(ChartThumbnail, { props: { dsl }, attachTo: document.body })
}

describe('ChartThumbnail', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    stubIntersectionObserver(true)
    vi.mocked(renderChart).mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('renders the full frame', async () => {
    const wrapper = mountThumbnail(chart(''))
    await flushPromises()
    expect(wrapper.find('.bc-frame').exists()).toBe(true)
    expect(wrapper.text()).toContain('Thumb title')
  })

  it('does not render before entering the viewport', async () => {
    stubIntersectionObserver(false)
    const wrapper = mountThumbnail(chart(''))
    await flushPromises()
    expect(wrapper.find('.bc-frame').exists()).toBe(false)
  })

  it('forces light on charts that disallow dark mode', async () => {
    useThemeStore().theme = 'dark'
    const locked = mountThumbnail(chart('allowDarkMode = false'))
    const free = mountThumbnail(chart(''))
    await flushPromises()
    expect(locked.find('.chart-card').attributes('data-bs-theme')).toBe('light')
    expect(free.find('.chart-card').attributes('data-bs-theme')).toBeUndefined()
  })

  it('re-renders when the resolved theme changes', async () => {
    const store = useThemeStore()
    store.theme = 'light'
    mountThumbnail(chart(''))
    await flushPromises()
    const calls = vi.mocked(renderChart).mock.calls.length
    store.theme = 'dark'
    await flushPromises()
    expect(vi.mocked(renderChart).mock.calls.length).toBe(calls + 1)
  })

  it('re-renders when the dsl prop changes', async () => {
    const wrapper = mountThumbnail(chart(''))
    await flushPromises()
    await wrapper.setProps({ dsl: chart('').replace('Thumb title', 'New title') })
    await flushPromises()
    expect(wrapper.find('.bc-frame').text()).toContain('New title')
  })

  it('renders the empty backdrop for an invalid DSL', async () => {
    const wrapper = mountThumbnail('not a chart')
    await flushPromises()
    expect(wrapper.find('.chart-thumbnail').exists()).toBe(true)
    expect(wrapper.find('.chart-card').exists()).toBe(false)
  })

  it('renders an empty card when the chart has no data', async () => {
    const wrapper = mountThumbnail(chart('', ''))
    await flushPromises()
    expect(wrapper.find('.chart-card').exists()).toBe(true)
    expect(wrapper.find('.bc-frame').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('No data to preview')
  })

  it('adds the transparent modifier', async () => {
    const wrapper = mountThumbnail(chart('transparentBackground = true'))
    await flushPromises()
    expect(wrapper.find('.chart-card').classes()).toContain('chart-card--transparent')
  })
})
