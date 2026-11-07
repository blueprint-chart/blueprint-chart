import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { initBlueprint, teardownBlueprint, buildSrcdoc } from './runtime'

describe('initBlueprint', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    teardownBlueprint()
  })

  afterEach(() => {
    teardownBlueprint()
  })

  it('finds and processes blueprint script tags', () => {
    document.body.innerHTML = `
      <script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>
    `
    initBlueprint()

    const iframe = document.querySelector('.blueprint-chart-iframe')
    expect(iframe).not.toBeNull()
    expect(iframe?.tagName).toBe('IFRAME')
  })

  it('creates iframe as a sibling before the script tag', () => {
    document.body.innerHTML = `
      <div id="wrapper">
        <script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>
      </div>
    `
    initBlueprint()

    const wrapper = document.getElementById('wrapper')!
    const children = Array.from(wrapper.children)
    expect(children[0].className).toBe('blueprint-chart-iframe')
    expect(children[1].tagName).toBe('SCRIPT')
  })

  it('skips empty script tags', () => {
    document.body.innerHTML = `
      <script type="application/blueprint-chart"></script>
      <script type="application/blueprint-chart">   </script>
    `
    initBlueprint()

    const iframes = document.querySelectorAll('.blueprint-chart-iframe')
    expect(iframes.length).toBe(0)
  })

  it('ignores non-blueprint script tags', () => {
    document.body.innerHTML = `
      <script type="text/javascript">console.log("hello")</script>
      <script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>
    `
    initBlueprint()

    const iframes = document.querySelectorAll('.blueprint-chart-iframe')
    expect(iframes.length).toBe(1)
  })

  it('processes multiple script tags', () => {
    document.body.innerHTML = `
      <script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>
      <script type="application/blueprint-chart">chart line { data { "B" = 20 } }</script>
    `
    initBlueprint()

    const iframes = document.querySelectorAll('.blueprint-chart-iframe')
    expect(iframes.length).toBe(2)
  })

  it('sets srcdoc that loads the runtime and renders the DSL', () => {
    // Exercise buildSrcdoc directly with a real runtime URL: initBlueprint()
    // relies on document.currentScript, which jsdom never populates, so it
    // cannot be used here to test the "runtime URL known" path.
    const srcdoc = buildSrcdoc(
      'chart bar { data { "A" = 10 } }',
      'https://example.com/blueprint-runtime.js',
    )
    // Runtime bundle is loaded INSIDE the iframe via a script tag.
    expect(srcdoc).toContain('<script src=')
    // The bootstrap calls the global renderer on the inlined source.
    expect(srcdoc).toContain('BlueprintChart.renderBpc')
    // The DSL is present (as a JS string literal).
    expect(srcdoc).toContain('chart bar')
    // The target container is present.
    expect(srcdoc).toContain('blueprint-chart-container')
  })

  it('inlines the DSL as a JS string with < escaped so it cannot break out', () => {
    document.body.innerHTML = `
      <script type="application/blueprint-chart"><img onerror="alert(1)"> test</script>
    `
    initBlueprint()

    const iframe = document.querySelector('.blueprint-chart-iframe') as HTMLIFrameElement
    // No raw markup that the iframe parser could act on.
    expect(iframe.srcdoc).not.toContain('<img')
    // `<` is unicode-escaped inside the JS string literal.
    expect(iframe.srcdoc).toContain('\\u003cimg')
  })

  it('sets sandbox attribute for security', () => {
    document.body.innerHTML = `
      <script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>
    `
    initBlueprint()

    const iframe = document.querySelector('.blueprint-chart-iframe') as HTMLIFrameElement
    expect(iframe.getAttribute('sandbox')).toBe('allow-scripts')
  })

  it('includes chart CSS in srcdoc', () => {
    document.body.innerHTML = `
      <script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>
    `
    initBlueprint()

    const iframe = document.querySelector('.blueprint-chart-iframe') as HTMLIFrameElement
    expect(iframe.srcdoc).toContain('<style>')
    expect(iframe.srcdoc).toContain('bc-frame-title')
  })

  describe('color scheme', () => {
    let listeners: Array<() => void>
    let matches: boolean

    beforeEach(() => {
      listeners = []
      matches = true
      window.matchMedia = vi.fn(() => ({
        get matches() {
          return matches
        },
        addEventListener: (_: string, fn: () => void) => listeners.push(fn),
        removeEventListener: (_: string, fn: () => void) => listeners.splice(listeners.indexOf(fn), 1),
      }) as unknown as MediaQueryList)
    })

    afterEach(() => {
      delete (window as Partial<Window>).matchMedia
    })

    const SCRIPT = '<script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>'

    it('follows prefers-color-scheme live when the host sets no theme', () => {
      document.body.innerHTML = SCRIPT
      initBlueprint()

      const iframe = document.querySelector('.blueprint-chart-iframe') as HTMLIFrameElement
      expect(iframe.srcdoc).toContain('<html data-bs-theme="dark">')
      matches = false
      listeners.forEach(fn => fn())
      expect(iframe.srcdoc).not.toContain('<html data-bs-theme="dark">')
    })

    it('keeps an explicit host data-bs-theme over the reader preference', () => {
      document.body.innerHTML = `<div data-bs-theme="light">${SCRIPT}</div>`
      initBlueprint()

      const iframe = document.querySelector('.blueprint-chart-iframe') as HTMLIFrameElement
      expect(iframe.srcdoc).not.toContain('<html data-bs-theme="dark">')
      expect(listeners).toHaveLength(0)
    })

    it('stops following the color scheme after teardown', () => {
      document.body.innerHTML = SCRIPT
      initBlueprint()
      teardownBlueprint()

      expect(listeners).toHaveLength(0)
    })
  })

  // ── Empty runtime URL hardening ──────────────────────────────────

  it('does not emit an empty-src script tag when runtimeUrl is empty', () => {
    const srcdoc = buildSrcdoc('chart bar-vertical { data { "A" = 10 } }', '')

    expect(srcdoc).not.toContain('src=""')
    expect(srcdoc).toContain('blueprint-chart-error')
  })

  // ── Listener cleanup (L5) ────────────────────────────────────────

  it('attaches only one window message listener across repeated init() calls', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    document.body.innerHTML = `
      <script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>
    `
    initBlueprint()
    initBlueprint()
    initBlueprint()

    const adds = addSpy.mock.calls.filter(c => c[0] === 'message')
    const removes = removeSpy.mock.calls.filter(c => c[0] === 'message')
    expect(adds.length - removes.length).toBe(1)

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('teardownBlueprint detaches the window message listener', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    document.body.innerHTML = `
      <script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>
    `
    initBlueprint()
    teardownBlueprint()

    const removes = removeSpy.mock.calls.filter(c => c[0] === 'message')
    expect(removes.length).toBeGreaterThanOrEqual(1)
    removeSpy.mockRestore()
  })
})
