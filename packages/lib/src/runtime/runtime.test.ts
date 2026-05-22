import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { initBlueprint, teardownBlueprint } from './runtime'

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

  it('sets srcdoc with escaped DSL content', () => {
    document.body.innerHTML = `
      <script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>
    `
    initBlueprint()

    const iframe = document.querySelector('.blueprint-chart-iframe') as HTMLIFrameElement
    expect(iframe.srcdoc).toContain('chart bar')
    expect(iframe.srcdoc).toContain('blueprint-chart-container')
  })

  it('escapes HTML in DSL content within srcdoc', () => {
    document.body.innerHTML = `
      <script type="application/blueprint-chart"><img onerror="alert(1)"> test</script>
    `
    initBlueprint()

    const iframe = document.querySelector('.blueprint-chart-iframe') as HTMLIFrameElement
    expect(iframe.srcdoc).not.toContain('<img')
    expect(iframe.srcdoc).toContain('&lt;img')
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
