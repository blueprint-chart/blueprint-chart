import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import type { AnnotationConfig } from '@blueprint-chart/lib'
import { useAnnotationDrag } from './useAnnotationDrag'

function makeSvgContainer(annotations: { id?: string, index: number }[]) {
  const container = document.createElement('div')
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '600')
  svg.setAttribute('height', '400')
  for (const ann of annotations) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('data-annotation-index', String(ann.index))
    if (ann.id) {
      g.setAttribute('data-annotation-id', ann.id)
    }
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.classList.add('bc-annotation-text')
    text.setAttribute('x', '100')
    text.setAttribute('y', '100')
    text.textContent = 'Label'
    // Stub getBBox (not available in jsdom)
    ;(text as any).getBBox = () => ({ x: 80, y: 85, width: 40, height: 20 })
    g.appendChild(text)
    svg.appendChild(g)
  }
  // Stub getScreenCTM
  ;(svg as any).getScreenCTM = () => ({ a: 1, d: 1 })
  container.appendChild(svg)
  return container
}

async function flush() {
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
}

describe('useAnnotationDrag', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => { cb(0); return 0 })
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('finds annotation by data-annotation-id when id is present', async () => {
    // Simulate filtered SVG: annotations at SVG indices 0 and 1,
    // but the editor list has 3 annotations (index 1 is hidden).
    // The selected annotation (index 2 in editor) has id "china" and
    // appears at SVG index 1.
    const container = makeSvgContainer([
      { id: 'japan', index: 0 },
      { id: 'china', index: 1 },
    ])

    const containerRef = ref<HTMLElement | null>(container)
    const annotations = ref<AnnotationConfig[]>([
      { kind: 'point', target: 'Japan', text: 'Japan', id: 'japan' },
      { kind: 'point', target: 'India', text: 'India', id: 'india' },
      { kind: 'point', target: 'China', text: 'China', id: 'china' },
    ])
    const selectedIndex = ref<number | null>(null)
    const onUpdate = vi.fn()

    useAnnotationDrag(containerRef, annotations, selectedIndex, onUpdate)

    // Select index 2 (China) — SVG has it at index 1 but with id "china"
    selectedIndex.value = 2
    await flush()

    // The overlay should be created on the correct element (found by id, not index)
    const svg = container.querySelector('svg')!
    const chinaG = svg.querySelector('g[data-annotation-id="china"]')!
    const overlay = chinaG.querySelector('rect')
    expect(overlay).toBeTruthy()
    expect(overlay!.style.cursor).toBe('grab')
  })

  it('falls back to data-annotation-index when annotation has no id', async () => {
    const container = makeSvgContainer([
      { index: 0 },
    ])

    const containerRef = ref<HTMLElement | null>(container)
    const annotations = ref<AnnotationConfig[]>([
      { kind: 'point', target: 'Japan', text: 'Japan' },
    ])
    const selectedIndex = ref<number | null>(null)
    const onUpdate = vi.fn()

    useAnnotationDrag(containerRef, annotations, selectedIndex, onUpdate)

    selectedIndex.value = 0
    await flush()

    const svg = container.querySelector('svg')!
    const g = svg.querySelector('g[data-annotation-index="0"]')!
    const overlay = g.querySelector('rect')
    expect(overlay).toBeTruthy()
  })

  it('does not create overlay when id-based lookup finds no match', async () => {
    // SVG only has "japan", but we select annotation with id "missing"
    const container = makeSvgContainer([
      { id: 'japan', index: 0 },
    ])

    const containerRef = ref<HTMLElement | null>(container)
    const annotations = ref<AnnotationConfig[]>([
      { kind: 'point', target: 'Japan', text: 'Japan', id: 'japan' },
      { kind: 'point', target: 'China', text: 'China', id: 'missing' },
    ])
    const selectedIndex = ref<number | null>(null)
    const onUpdate = vi.fn()

    useAnnotationDrag(containerRef, annotations, selectedIndex, onUpdate)

    selectedIndex.value = 1
    await flush()

    const svg = container.querySelector('svg')!
    const overlays = svg.querySelectorAll('rect')
    expect(overlays.length).toBe(0)
  })
})
