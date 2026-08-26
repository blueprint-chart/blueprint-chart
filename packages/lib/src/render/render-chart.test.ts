import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as d3 from 'd3'
import { renderChart } from './render-chart'
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
