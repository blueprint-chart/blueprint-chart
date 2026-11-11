import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import * as d3 from 'd3'
import { renderChart } from './render-chart'
import { renderBpc } from './render-bpc'
import { getSceneTransition } from '../transitions'
import { registerChart } from '../charts/registry'
import { ChartType, ChartOptionType } from '../enums'
import type { ChartDefinition } from './types'

function baseDef(overrides: Partial<ChartDefinition> = {}): ChartDefinition {
  return {
    chartType: ChartType.BarVertical,
    data: { labels: ['a', 'b', 'c'], values: [1, 2, 3] },
    options: {},
    ...overrides,
  }
}

describe('renderChart', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('renders an SVG into the container', () => {
    renderChart(container, baseDef())
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders nothing when data is empty', () => {
    renderChart(container, baseDef({ data: { labels: [], values: [] } }))
    expect(container.querySelector('svg')).toBeNull()
  })

  it('omits frame in thumbnail mode', () => {
    renderChart(container, baseDef({ frame: { title: 'Foo' } }), { thumbnail: true })
    expect(container.querySelector('.bc-frame-header')).toBeNull()
  })

  it('applies theme class to .bc-frame', () => {
    renderChart(container, baseDef({ frame: { title: 'Foo' }, theme: 'dark' }))
    expect(container.querySelector('.bc-frame')?.classList.contains('bc-theme-dark')).toBe(true)
  })

  it('clears container on non-transition render', () => {
    const sentinel = document.createElement('span')
    sentinel.id = 'sentinel'
    container.appendChild(sentinel)
    renderChart(container, baseDef())
    expect(container.querySelector('#sentinel')).toBeNull()
  })

  // S4: empty data while transition=true must still wipe stale DOM
  it('clears container on transition render with empty data', () => {
    const sentinel = document.createElement('span')
    sentinel.id = 'stale'
    container.appendChild(sentinel)
    renderChart(container, baseDef({ data: { labels: [], values: [] } }), { transition: true })
    expect(container.querySelector('#stale')).toBeNull()
  })

  // S8: stripColors must scrub colors from pre-resolved `options`, not just properties
  it('stripColors strips colors from pre-resolved options', () => {
    // Render once WITH the explicit red palette baked into options to capture
    // the "no strip" fill, then render again with stripColors=true.
    const defWithRed = baseDef({
      options: { colors: ['#ff0000'] },
    })
    renderChart(container, defWithRed)
    const withRedFill = container.querySelector('rect:not(.bc-canvas-bg)')?.getAttribute('fill') ?? ''
    expect(withRedFill.toLowerCase()).toBe('#ff0000')

    // Now strip — must NOT pick up the red from options.
    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    renderChart(container2, defWithRed, { stripColors: true })
    const strippedFill = container2.querySelector('rect:not(.bc-canvas-bg)')?.getAttribute('fill') ?? ''
    expect(strippedFill.toLowerCase()).not.toBe('#ff0000')
  })

  it('passes an option registered via registerChart to the renderer', () => {
    const seen: unknown[] = []
    registerChart('g1-registered-probe', (_container, _data, opts) => {
      seen.push((opts as Record<string, unknown>).myScale)
    }, [{ key: 'myScale', type: ChartOptionType.Text, label: 'My scale', default: '1' }])

    renderChart(container, baseDef({
      chartType: 'g1-registered-probe',
      options: { myScale: '12' } as never,
    }))

    expect(seen).toEqual(['12'])
  })
})

function minimalBarVerticalDefinition(values: number[]): ChartDefinition {
  return {
    chartType: 'bar-vertical',
    data: { labels: values.map((_, i) => String.fromCharCode(97 + i)), values },
  }
}

describe('renderChart + SceneTransition integration', () => {
  it('drives the orchestrator lifecycle on transition=true', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    // First render with no transition — orchestrator stays idle.
    renderChart(container, minimalBarVerticalDefinition([10, 20]), { transition: false })
    const orch = getSceneTransition(container)
    expect(orch.state).toBe('idle')

    // Second render with transition=true — orchestrator runs the lifecycle.
    // Synchronously it may end in 'animating' (a d3 transition was scheduled)
    // or 'idle' (snap path) — both are acceptable; what matters is it ran.
    renderChart(container, minimalBarVerticalDefinition([20, 30]), { transition: true })
    expect(['animating', 'idle']).toContain(orch.state)

    // Tear down so any in-flight legacy d3 transitions can't fire post-test.
    orch.destroy()
    d3.select(container).interrupt()
    d3.select(container).selectAll('*').interrupt()
    container.remove()
  })

  it('continues an in-flight scene tween when a plain re-render arrives mid-tween', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    renderChart(container, minimalBarVerticalDefinition([10, 20]), { transition: false })
    renderChart(container, minimalBarVerticalDefinition([40, 5]), { transition: true })
    const orch = getSceneTransition(container)
    expect(orch.state).toBe('animating')
    const tweeningBar = container.querySelector('.bc-bar')

    renderChart(container, minimalBarVerticalDefinition([40, 5]), { transition: false })

    expect(container.querySelector('.bc-bar')).toBe(tweeningBar)
    expect(orch.state).toBe('animating')

    orch.destroy()
    d3.select(container).selectAll('*').interrupt()
    container.remove()
  })

  it('warns once and falls back to snap when an unknown transitionMode is passed', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    renderChart(container, minimalBarVerticalDefinition([10, 20]), { transition: false })
    renderChart(container, minimalBarVerticalDefinition([20, 30]), { transition: true, transitionMode: 'slide-x' })

    // The orchestrator's mode dispatch should have produced at least one
    // 'transition mode … is not yet implemented' warning. Other warnings
    // (e.g. from chart renderer plumbing) may also fire, so we filter.
    const modeWarnings = warn.mock.calls.filter(call =>
      typeof call[0] === 'string' && call[0].includes('transition mode \'slide-x\''),
    )
    expect(modeWarnings.length).toBeGreaterThan(0)

    const orch = getSceneTransition(container)
    expect(orch.state).toBe('idle')

    orch.destroy()
    d3.select(container).interrupt()
    d3.select(container).selectAll('*').interrupt()
    warn.mockRestore()
    container.remove()
  })
})

describe('striped range overlays across scenes', () => {
  // jsdom has no SVGElement.transform; d3 reads it to tween axis transforms.
  beforeAll(() => {
    Object.defineProperty(window.SVGElement.prototype, 'transform', { configurable: true, get: () => ({ baseVal: { consolidate: () => null } }) })
  })

  afterAll(() => {
    delete (window.SVGElement.prototype as { transform?: unknown }).transform
  })

  it('moves a repeated striped range overlay with its bar on a scene change', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const bpc = `chart bar-vertical {
      data {
        series = "V","Lo","Hi"
        "A" = 2,1,3
        "B" = 5,4,6
      }
      overlay "Lo" "Hi" {
        pattern = stripes
        repeat = true
      }
      scene {
        transform sort {
          direction = "descending"
          columns = "V"
        }
      }
    }`
    renderBpc(container, bpc)
    renderBpc(container, bpc, { sceneIndex: 0, transition: true })
    await new Promise(resolve => setTimeout(resolve, 1500))

    const bars = Array.from(container.querySelectorAll('.bc-bar'))
    const ranges = Array.from(container.querySelectorAll('.bc-overlay-stripes'))
    const barX = bars.map(bar => bar.getAttribute('x'))
    const rangeX = ranges.map(range => range.getAttribute('x'))
    expect(rangeX).toEqual(barX)

    getSceneTransition(container).destroy()
    container.remove()
  })

  it('fades in a striped range overlay and its bar mask when a scene adds it', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const bpc = `chart bar-vertical {
      data {
        series = "V","Lo","Hi"
        "A" = 2,1,3
        "B" = 5,4,6
      }
      scene {
        overlay "Lo" "Hi" {
          pattern = stripes
        }
      }
    }`
    renderBpc(container, bpc)
    renderBpc(container, bpc, { sceneIndex: 0, transition: true })
    await new Promise(resolve => setTimeout(resolve, 1500))

    const ranges = Array.from(container.querySelectorAll('.bc-overlay-stripes'))
    const holes = Array.from(container.querySelectorAll('.bc-overlay-mask-range'))
    const opacities = [...ranges, ...holes].map(el => el.getAttribute('opacity'))
    expect(opacities).toEqual(['1', '1', '1', '1'])

    getSceneTransition(container).destroy()
    container.remove()
  })
})

describe('a re-render leaves no stranded tooltip', () => {
  // The proximity tooltip is a body-level div positioned once per mousemove
  // against the highlight dot. Nothing repositions it, so a re-render under a
  // still cursor must tear it down: left in place it reads the old datum while
  // the crosshair and the dot have moved, showing two readings at once.
  const TYPES: Record<string, string> = {
    'line': `chart line {
  tooltips = true
  data {
    "Jan" = 10
    "Feb" = 25
    "Mar" = 15
  }
}`,
    'area': `chart area {
  tooltips = true
  data {
    "Jan" = 10
    "Feb" = 25
    "Mar" = 15
  }
}`,
    'line-multi': `chart line-multi {
  tooltips = true
  data {
    series = "A","B"
    "Jan" = 10,4
    "Feb" = 25,8
  }
}`,
    'area-stacked': `chart area-stacked {
  tooltips = true
  data {
    series = "A","B"
    "Jan" = 10,4
    "Feb" = 25,8
  }
}`,
  }

  let container: HTMLElement
  beforeEach(() => {
    document.body.replaceChildren()
    document.querySelectorAll('.bc-tooltip').forEach(el => el.remove())
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  for (const [type, bpc] of Object.entries(TYPES)) {
    for (const transition of [false, true]) {
      it(`${type} clears its tooltip on a re-render (transition=${transition})`, () => {
        renderBpc(container, bpc)
        container.querySelector('.bc-proximity-overlay')!
          .dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100, bubbles: true }))
        const hovered = document.querySelectorAll<HTMLElement>('.bc-tooltip')
        expect(hovered).toHaveLength(1)
        expect(hovered[0].style.display).toBe('block')
        expect(hovered[0].textContent).not.toBe('')

        renderBpc(container, bpc, { transition })

        const after = document.querySelectorAll<HTMLElement>('.bc-tooltip')
        expect(after).toHaveLength(1)
        expect(after[0].style.display).not.toBe('block')
        expect(after[0].textContent).toBe('')
      })
    }
  }
})

describe('renderChart accessibility (#87)', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  function plotSvg(): SVGSVGElement {
    return container.querySelector('.bc-frame-body svg') as SVGSVGElement
  }

  it('marks the plot as a single graphic with an accessible name', () => {
    renderChart(container, baseDef({ frame: { title: 'Coal still generates a third' } }))
    expect(plotSvg().getAttribute('role')).toBe('img')
    expect(plotSvg().getAttribute('aria-label')).toBe('Coal still generates a third')
  })

  it('falls back to the chart type when there is no headline', () => {
    renderChart(container, baseDef())
    expect(plotSvg().getAttribute('aria-label')).toBe('bar vertical chart')
  })

  it('emits title and desc, with the data summary in the description', () => {
    renderChart(container, baseDef({ frame: { title: 'T', description: 'D' } }))
    const svg = plotSvg()
    expect(svg.querySelector('title')?.textContent).toBe('T')
    const desc = svg.querySelector('desc')?.textContent ?? ''
    expect(desc).toContain('D')
    expect(desc).toContain('3 categories')
    expect(desc).toContain('1 to 3')
  })

  it('keeps title before desc and does not duplicate them across renders', () => {
    renderChart(container, baseDef({ frame: { title: 'T' } }))
    renderChart(container, baseDef({ frame: { title: 'T2' } }))
    const svg = plotSvg()
    expect(svg.querySelectorAll('title')).toHaveLength(1)
    expect(svg.querySelectorAll('desc')).toHaveLength(1)
    expect(svg.firstElementChild?.tagName).toBe('title')
    expect(svg.querySelector('title')?.textContent).toBe('T2')
  })
})
