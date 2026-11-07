import { mount } from '@vue/test-utils'
import RenderPage from './RenderPage.vue'

const resizeCallbacks = vi.hoisted(() => [] as ((entries: { target: Element }[]) => void)[])

vi.mock('@vueuse/core', async importOriginal => ({
  ...await importOriginal<typeof import('@vueuse/core')>(),
  useResizeObserver: (_target: unknown, callback: (entries: { target: Element }[]) => void) => {
    resizeCallbacks.push(callback)
  },
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  RouterLink: { template: '<a><slot /></a>' },
}))

describe('RenderPage', () => {
  beforeEach(() => {
    resizeCallbacks.length = 0
    vi.restoreAllMocks()
  })

  it('posts its card height to the parent page', () => {
    const postMessage = vi.spyOn(window.parent, 'postMessage')
    const wrapper = mount(RenderPage, { global: { plugins: [createPinia()] } })
    const card = wrapper.find('.render-page__card').element
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({ height: 312.4 } as DOMRect)

    resizeCallbacks.forEach(callback => callback([{ target: card }]))

    expect(postMessage).toHaveBeenCalledWith({ type: 'blueprint-chart-resize', height: 313 }, '*')
  })

  it('does not post a zero height while the card is still empty', () => {
    const postMessage = vi.spyOn(window.parent, 'postMessage')
    const wrapper = mount(RenderPage, { global: { plugins: [createPinia()] } })
    const card = wrapper.find('.render-page__card').element
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({ height: 0 } as DOMRect)

    resizeCallbacks.forEach(callback => callback([{ target: card }]))

    expect(postMessage).not.toHaveBeenCalled()
  })
})
