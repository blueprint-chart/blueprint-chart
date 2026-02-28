import { describe, it, expect, beforeEach } from 'vitest'
import { initBlueprint } from './runtime'

function setBody(html: string): void {
  document.body.innerHTML = html
}

beforeEach(() => {
  setBody('')
})

describe('initBlueprint script tag discovery', () => {
  it('finds and processes blueprint script tags', () => {
    setBody('<script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>')
    initBlueprint()

    const iframe = document.querySelector('.blueprint-chart-iframe')
    expect(iframe).not.toBeNull()
    expect(iframe?.tagName).toBe('IFRAME')
  })

  it('skips empty script tags', () => {
    setBody([
      '<script type="application/blueprint-chart"></script>',
      '<script type="application/blueprint-chart">   </script>',
    ].join(''))
    initBlueprint()

    const iframes = document.querySelectorAll('.blueprint-chart-iframe')
    expect(iframes.length).toBe(0)
  })
})

describe('initBlueprint script tag filtering', () => {
  it('ignores non-blueprint script tags', () => {
    setBody([
      '<script type="text/javascript">console.log("hello")</script>',
      '<script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>',
    ].join(''))
    initBlueprint()

    const iframes = document.querySelectorAll('.blueprint-chart-iframe')
    expect(iframes.length).toBe(1)
  })

  it('processes multiple script tags', () => {
    setBody([
      '<script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>',
      '<script type="application/blueprint-chart">chart line { data { "B" = 20 } }</script>',
    ].join(''))
    initBlueprint()

    const iframes = document.querySelectorAll('.blueprint-chart-iframe')
    expect(iframes.length).toBe(2)
  })
})

describe('initBlueprint iframe creation', () => {
  it('creates iframe as a sibling before the script tag', () => {
    setBody('<div id="wrapper"><script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script></div>')
    initBlueprint()

    const wrapper = document.getElementById('wrapper')!
    const children = Array.from(wrapper.children)
    expect(children[0].className).toBe('blueprint-chart-iframe')
    expect(children[1].tagName).toBe('SCRIPT')
  })

  it('sets srcdoc with escaped DSL content', () => {
    setBody('<script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>')
    initBlueprint()

    const iframe = document.querySelector('.blueprint-chart-iframe') as HTMLIFrameElement
    expect(iframe.srcdoc).toContain('chart bar')
    expect(iframe.srcdoc).toContain('blueprint-chart-container')
  })

  it('includes chart CSS in srcdoc', () => {
    setBody('<script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>')
    initBlueprint()

    const iframe = document.querySelector('.blueprint-chart-iframe') as HTMLIFrameElement
    expect(iframe.srcdoc).toContain('<style>')
    expect(iframe.srcdoc).toContain('bc-frame-title')
  })
})

describe('initBlueprint security', () => {
  it('escapes HTML in DSL content within srcdoc', () => {
    setBody('<script type="application/blueprint-chart"><img onerror="alert(1)"> test</script>')
    initBlueprint()

    const iframe = document.querySelector('.blueprint-chart-iframe') as HTMLIFrameElement
    expect(iframe.srcdoc).not.toContain('<img')
    expect(iframe.srcdoc).toContain('&lt;img')
  })

  it('sets sandbox attribute for security', () => {
    setBody('<script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>')
    initBlueprint()

    const iframe = document.querySelector('.blueprint-chart-iframe') as HTMLIFrameElement
    expect(iframe.getAttribute('sandbox')).toBe('allow-scripts')
  })
})
