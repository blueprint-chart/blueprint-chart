import type { EffectScope } from 'vue'
import type { AnnotationConfig } from '@blueprint-chart/lib'
import { useAnnotationDrag, computeElbowPath, buildPathD, shortenToward, bboxEdgeToward } from './useAnnotationDrag'

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(text as any).getBBox = () => ({ x: 80, y: 85, width: 40, height: 20 })
    g.appendChild(text)
    svg.appendChild(g)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(svg as any).getScreenCTM = () => ({ a: 1, d: 1 })
  container.appendChild(svg)
  return container
}

async function flush() {
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
}

describe('computeElbowPath', () => {
  it('returns vertical-first elbow when departVertical is true', () => {
    const result = computeElbowPath({ x: 10, y: 10 }, { x: 50, y: 80 }, true)
    expect(result).toMatch(/^M 10 10 L/)
    // Should have two L commands (mid and end)
    const parts = result.split('L')
    expect(parts).toHaveLength(3)
    // Final point should be the target
    expect(result).toContain('50 80')
  })

  it('returns horizontal-first elbow when departVertical is false', () => {
    const result = computeElbowPath({ x: 10, y: 10 }, { x: 80, y: 50 }, false)
    expect(result).toMatch(/^M 10 10 L/)
    // Mid-point Y should equal from.y (horizontal first)
    const parts = result.split('L')
    const midCoords = parts[1].trim().split(' ')
    expect(parseFloat(midCoords[1])).toBe(10)
    expect(result).toContain('80 50')
  })

  it('handles target above source with vertical departure', () => {
    const result = computeElbowPath({ x: 50, y: 100 }, { x: 80, y: 20 }, true)
    expect(result).toMatch(/^M 50 100 L/)
    // Mid-point X should equal from.x (vertical first)
    const parts = result.split('L')
    const midCoords = parts[1].trim().split(' ')
    expect(parseFloat(midCoords[0])).toBe(50)
    expect(result).toContain('80 20')
  })

  it('handles target to the left with horizontal departure', () => {
    const result = computeElbowPath({ x: 100, y: 50 }, { x: 20, y: 80 }, false)
    expect(result).toMatch(/^M 100 50 L/)
    expect(result).toContain('20 80')
  })
})

describe('buildPathD', () => {
  it('returns straight line for default style', () => {
    const result = buildPathD({ x: 0, y: 0 }, { x: 100, y: 100 }, 'direct', false)
    expect(result).toBe('M 0 0 L 100 100')
  })

  it('returns arc for curve-right', () => {
    const result = buildPathD({ x: 0, y: 0 }, { x: 100, y: 0 }, 'curve-right', false)
    expect(result).toMatch(/^M 0 0 A/)
    expect(result).toContain('1') // sweep = 1 for curve-right
    expect(result).toMatch(/100 0$/)
  })

  it('returns arc for curve-left with sweep 0', () => {
    const result = buildPathD({ x: 0, y: 0 }, { x: 100, y: 0 }, 'curve-left', false)
    expect(result).toMatch(/^M 0 0 A/)
    // sweep should be 0 for curve-left
    expect(result).toMatch(/0 0 0/)
  })

  it('returns elbow path for elbow style', () => {
    const result = buildPathD({ x: 10, y: 10 }, { x: 50, y: 80 }, 'elbow', true)
    const parts = result.split('L')
    expect(parts).toHaveLength(3)
  })
})

describe('shortenToward', () => {
  it('returns anchor when distance is 0', () => {
    const result = shortenToward({ x: 100, y: 100 }, { x: 0, y: 0 }, 0)
    expect(result).toEqual({ x: 100, y: 100 })
  })

  it('returns anchor when distance is negative', () => {
    const result = shortenToward({ x: 100, y: 100 }, { x: 0, y: 0 }, -5)
    expect(result).toEqual({ x: 100, y: 100 })
  })

  it('returns anchor when from equals anchor', () => {
    const result = shortenToward({ x: 50, y: 50 }, { x: 50, y: 50 }, 10)
    expect(result).toEqual({ x: 50, y: 50 })
  })

  it('shortens along horizontal axis', () => {
    const result = shortenToward({ x: 100, y: 0 }, { x: 0, y: 0 }, 10)
    expect(result.x).toBeCloseTo(90)
    expect(result.y).toBeCloseTo(0)
  })

  it('shortens along vertical axis', () => {
    const result = shortenToward({ x: 0, y: 100 }, { x: 0, y: 0 }, 20)
    expect(result.x).toBeCloseTo(0)
    expect(result.y).toBeCloseTo(80)
  })

  it('shortens along diagonal', () => {
    const result = shortenToward({ x: 100, y: 100 }, { x: 0, y: 0 }, Math.sqrt(200))
    expect(result.x).toBeCloseTo(90)
    expect(result.y).toBeCloseTo(90)
  })
})

describe('bboxEdgeToward', () => {
  const bbox = { x: 40, y: 40, width: 20, height: 20 }
  // center is (50, 50)

  it('returns center when target equals center', () => {
    const result = bboxEdgeToward(bbox, 50, 50)
    expect(result).toEqual({ x: 50, y: 50 })
  })

  it('exits from bottom when target is directly below', () => {
    const result = bboxEdgeToward(bbox, 50, 100)
    expect(result.x).toBe(50)
    expect(result.y).toBe(64) // bbox.y + height + LINE_PAD = 40 + 20 + 4
  })

  it('exits from top when target is directly above', () => {
    const result = bboxEdgeToward(bbox, 50, 0)
    expect(result.x).toBe(50)
    expect(result.y).toBe(36) // bbox.y - LINE_PAD = 40 - 4
  })

  it('exits from right when target is directly right', () => {
    const result = bboxEdgeToward(bbox, 200, 50)
    expect(result.x).toBe(64) // bbox.x + width + LINE_PAD = 40 + 20 + 4
    expect(result.y).toBe(50)
  })

  it('exits from left when target is directly left', () => {
    const result = bboxEdgeToward(bbox, 0, 50)
    expect(result.x).toBe(36) // bbox.x - LINE_PAD = 40 - 4
    expect(result.y).toBe(50)
  })

  it('chooses closest side for diagonal targets', () => {
    // Target far below-right but within horizontal range
    const result = bboxEdgeToward(bbox, 50, 200)
    expect(result.y).toBe(64) // bottom edge
  })

  it('falls back to closest midpoint when target is outside both axes', () => {
    // Target at top-left corner, outside both N/S and E/W candidate zones
    const result = bboxEdgeToward(bbox, 0, 0)
    // Should pick closest of the 4 midpoints
    expect(result.x).toBeDefined()
    expect(result.y).toBeDefined()
  })
})

describe('useAnnotationDrag', () => {
  let scope: EffectScope

  beforeEach(() => {
    scope = effectScope()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 0
    })
  })
  afterEach(() => {
    scope.stop()
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

    scope.run(() => useAnnotationDrag(containerRef, annotations, selectedIndex, onUpdate))

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

    scope.run(() => useAnnotationDrag(containerRef, annotations, selectedIndex, onUpdate))

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

    scope.run(() => useAnnotationDrag(containerRef, annotations, selectedIndex, onUpdate))

    selectedIndex.value = 1
    await flush()

    const svg = container.querySelector('svg')!
    const overlays = svg.querySelectorAll('rect')
    expect(overlays.length).toBe(0)
  })
})
