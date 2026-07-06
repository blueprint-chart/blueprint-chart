import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'

// The real IIFE URL import (`?url`) is not resolvable under vitest; stub it.
vi.mock('@blueprint-chart/lib/embed-runtime.js?url', () => ({
  default: '/stub/lib.iife.js',
}))

// VitePress is not booted under vitest; stub useData so the component can read
// the current theme. Light by default.
vi.mock('vitepress', () => ({
  useData: () => ({ isDark: ref(false) }),
}))

// Stub the narrow embed entry so the test does not pull the lib into the
// runner. Mirror the real message contract the component depends on. The
// buildSrcdoc stub echoes the theme flag it receives so tests can assert it.
vi.mock('@blueprint-chart/lib/embed', () => ({
  buildSrcdoc: (dsl: string, url: string, theme?: string) =>
    `<!DOCTYPE html><html data-theme='${theme ?? ''}'><script src="${url}"></script><script>BlueprintChart.renderBpc(x, ${JSON.stringify(dsl)})</script>`,
  readResizeHeight: (data: unknown) =>
    (data as { type?: string, height?: unknown })?.type === 'blueprint-chart-resize'
    && typeof (data as { height?: unknown }).height === 'number'
      ? (data as { height: number }).height
      : null,
  isErrorMessage: (data: unknown) =>
    (data as { type?: string })?.type === 'blueprint-chart-error',
}))

import BpcPreview from './BpcPreview.vue'

describe('BpcPreview', () => {
  it('renders an iframe whose srcdoc loads the runtime and the source when active', async () => {
    const wrapper = mount(BpcPreview, {
      props: { source: 'chart bar { data { "A" = 10 } }', active: true },
    })
    await nextTick()

    const iframe = wrapper.get('iframe.bpc-preview__frame')
    const srcdoc = iframe.attributes('srcdoc')!
    // The component absolutizes the runtime URL before writing it into the
    // srcdoc, so assert the absolute form is present, not just the raw path.
    const absoluteRuntimeUrl = new URL('/stub/lib.iife.js', globalThis.location.href).href
    expect(srcdoc).toContain(absoluteRuntimeUrl)
    expect(srcdoc).toContain('chart bar')
  })

  it('forces the current docs theme (light) via buildSrcdoc', async () => {
    const wrapper = mount(BpcPreview, {
      props: { source: 'chart bar { data { "A" = 10 } }', active: true },
    })
    await nextTick()

    // useData is stubbed to isDark=false, so the light theme flag is forwarded.
    const srcdoc = wrapper.get('iframe.bpc-preview__frame').attributes('srcdoc')!
    expect(srcdoc).toContain('data-theme=\'light\'')
  })

  it('keeps srcdoc empty until the preview tab is active', async () => {
    const wrapper = mount(BpcPreview, {
      props: { source: 'chart bar { data { "A" = 10 } }', active: false },
    })
    await nextTick()

    const iframe = wrapper.get('iframe.bpc-preview__frame')
    expect(iframe.attributes('srcdoc')).toBe('')
  })

  it('sizes the iframe from a resize message and ignores foreign sources', async () => {
    const wrapper = mount(BpcPreview, {
      props: { source: 'chart bar { data { "A" = 10 } }', active: true },
      attachTo: document.body,
    })
    await nextTick()

    const iframeEl = wrapper.get('iframe.bpc-preview__frame').element as HTMLIFrameElement
    // Positive: both sides are jsdom's null contentWindow, so the message
    // matches the component's own iframe and applies.
    window.dispatchEvent(new MessageEvent('message', {
      data: { type: 'blueprint-chart-resize', height: 412 },
      source: iframeEl.contentWindow,
    }))
    await nextTick()
    expect(iframeEl.style.height).toBe('412px')

    // Negative: `window` is a real, non-null object that is NOT the iframe's
    // contentWindow, so the scoping guard must reject it.
    window.dispatchEvent(new MessageEvent('message', {
      data: { type: 'blueprint-chart-resize', height: 9999 },
      source: window,
    }))
    await nextTick()
    expect(iframeEl.style.height).toBe('412px')
    wrapper.unmount()
  })

  it('shows an error message when the iframe reports a render error', async () => {
    const wrapper = mount(BpcPreview, {
      props: { source: 'chart bar { data { "A" = 10 } }', active: true },
      attachTo: document.body,
    })
    await nextTick()

    const iframeEl = wrapper.get('iframe.bpc-preview__frame').element as HTMLIFrameElement
    expect(wrapper.find('.bpc-preview__error').exists()).toBe(false)

    window.dispatchEvent(new MessageEvent('message', {
      data: { type: 'blueprint-chart-error', message: 'boom' },
      source: iframeEl.contentWindow,
    }))
    await nextTick()

    expect(wrapper.find('.bpc-preview__error').exists()).toBe(true)
    wrapper.unmount()
  })
})
