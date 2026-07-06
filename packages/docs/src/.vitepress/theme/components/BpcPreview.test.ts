import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

// The real IIFE URL import (`?url`) is not resolvable under vitest; stub it.
vi.mock('@blueprint-chart/lib/embed-runtime.js?url', () => ({
  default: '/stub/lib.iife.js',
}))

// Stub buildSrcdoc so the test does not pull the whole lib into the runner.
vi.mock('@blueprint-chart/lib', () => ({
  buildSrcdoc: (dsl: string, url: string) =>
    `<!DOCTYPE html><script src="${url}"></script><script>BlueprintChart.renderBpc(x, ${JSON.stringify(dsl)})</script>`,
}))

import BpcPreview from './BpcPreview.vue'

describe('BpcPreview', () => {
  it('renders an iframe whose srcdoc loads the runtime and the source', async () => {
    const wrapper = mount(BpcPreview, { props: { source: 'chart bar { data { "A" = 10 } }' } })
    await nextTick()

    const iframe = wrapper.get('iframe.bpc-preview__frame')
    const srcdoc = iframe.attributes('srcdoc')!
    // The component absolutizes the runtime URL before writing it into the
    // srcdoc, so assert the absolute form is present, not just the raw path.
    const absoluteRuntimeUrl = new URL('/stub/lib.iife.js', globalThis.location.href).href
    expect(srcdoc).toContain(absoluteRuntimeUrl)
    expect(srcdoc).toContain('chart bar')
  })

  it('sizes the iframe from a resize message', async () => {
    const wrapper = mount(BpcPreview, {
      props: { source: 'chart bar { data { "A" = 10 } }' },
      attachTo: document.body,
    })
    await nextTick()

    const iframeEl = wrapper.get('iframe.bpc-preview__frame').element as HTMLIFrameElement
    // Simulate the message; source-matching is bypassed because the jsdom
    // iframe has no contentWindow, so the component must tolerate that by
    // matching on the event data shape for its own iframe.
    window.dispatchEvent(new MessageEvent('message', {
      data: { type: 'blueprint-chart-resize', height: 412 },
      source: iframeEl.contentWindow,
    }))
    await nextTick()

    expect(iframeEl.style.height).toBe('412px')

    // Negative case: a message whose source is NOT the preview's own iframe
    // must be ignored, even if it has the right shape. `window` is a real,
    // non-null object here so it genuinely fails the `=== contentWindow`
    // check (unlike the positive case above, where both sides are jsdom's
    // null `contentWindow`), exercising the own-frame scoping guard.
    window.dispatchEvent(new MessageEvent('message', {
      data: { type: 'blueprint-chart-resize', height: 9999 },
      source: window,
    }))
    await nextTick()

    expect(iframeEl.style.height).toBe('412px')
    wrapper.unmount()
  })
})
