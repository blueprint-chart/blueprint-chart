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
