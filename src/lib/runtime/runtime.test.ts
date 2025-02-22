import { describe, it, expect, beforeEach } from 'vitest'
import { initBlueprint } from './runtime'

describe('initBlueprint', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('finds and processes blueprint script tags', () => {
    document.body.innerHTML = `
      <script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>
    `
    initBlueprint()

    const container = document.querySelector('.blueprint-chart-container')
    expect(container).not.toBeNull()
    expect(container?.querySelector('.blueprint-chart-placeholder')).not.toBeNull()
  })

  it('creates container as a sibling before the script tag', () => {
    document.body.innerHTML = `
      <div id="wrapper">
        <script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>
      </div>
    `
    initBlueprint()

    const wrapper = document.getElementById('wrapper')!
    const children = Array.from(wrapper.children)
    expect(children[0].className).toBe('blueprint-chart-container')
    expect(children[1].tagName).toBe('SCRIPT')
  })

  it('skips empty script tags', () => {
    document.body.innerHTML = `
      <script type="application/blueprint-chart"></script>
      <script type="application/blueprint-chart">   </script>
    `
    initBlueprint()

    const containers = document.querySelectorAll('.blueprint-chart-container')
    expect(containers.length).toBe(0)
  })

  it('ignores non-blueprint script tags', () => {
    document.body.innerHTML = `
      <script type="text/javascript">console.log("hello")</script>
      <script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>
    `
    initBlueprint()

    const containers = document.querySelectorAll('.blueprint-chart-container')
    expect(containers.length).toBe(1)
  })

  it('processes multiple script tags', () => {
    document.body.innerHTML = `
      <script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>
      <script type="application/blueprint-chart">chart line { data { "B" = 20 } }</script>
    `
    initBlueprint()

    const containers = document.querySelectorAll('.blueprint-chart-container')
    expect(containers.length).toBe(2)
  })

  it('renders placeholder with DSL content', () => {
    document.body.innerHTML = `
      <script type="application/blueprint-chart">chart bar { data { "A" = 10 } }</script>
    `
    initBlueprint()

    const placeholder = document.querySelector('.blueprint-chart-placeholder')
    expect(placeholder).not.toBeNull()
    expect(placeholder?.textContent).toContain('chart bar')
  })

  it('escapes HTML in DSL content', () => {
    document.body.innerHTML = `
      <script type="application/blueprint-chart"><img onerror="alert(1)"> test</script>
    `
    initBlueprint()

    const placeholder = document.querySelector('.blueprint-chart-placeholder')
    expect(placeholder).not.toBeNull()
    // The raw HTML should be escaped via textContent, not rendered as an element
    expect(placeholder?.querySelector('img')).toBeNull()
  })
})
