import { describe, it, expect } from 'vitest'
import { computeElbowPath, buildPathD, shortenToward, bboxEdgeToward, LINE_PAD } from './geometry'

describe('computeElbowPath', () => {
  it('returns vertical-first elbow when departVertical is true', () => {
    const result = computeElbowPath({ x: 10, y: 10 }, { x: 50, y: 80 }, true)
    expect(result).toMatch(/^M 10 10 L/)
    const parts = result.split('L')
    expect(parts).toHaveLength(3)
    // Mid-point X should equal from.x (vertical first)
    const midCoords = parts[1].trim().split(' ')
    expect(parseFloat(midCoords[0])).toBe(10)
    expect(result).toContain('50 80')
  })

  it('returns horizontal-first elbow when departVertical is false', () => {
    const result = computeElbowPath({ x: 10, y: 10 }, { x: 80, y: 50 }, false)
    expect(result).toMatch(/^M 10 10 L/)
    const parts = result.split('L')
    const midCoords = parts[1].trim().split(' ')
    expect(parseFloat(midCoords[1])).toBe(10)
    expect(result).toContain('80 50')
  })

  it('handles target above source with vertical departure', () => {
    const result = computeElbowPath({ x: 50, y: 100 }, { x: 80, y: 20 }, true)
    expect(result).toMatch(/^M 50 100 L/)
    const parts = result.split('L')
    const midCoords = parts[1].trim().split(' ')
    expect(parseFloat(midCoords[0])).toBe(50)
    // Mid-point Y should be less than from.y (going up)
    expect(parseFloat(midCoords[1])).toBeLessThan(100)
    expect(result).toContain('80 20')
  })

  it('handles target to the left with horizontal departure', () => {
    const result = computeElbowPath({ x: 100, y: 50 }, { x: 20, y: 80 }, false)
    expect(result).toMatch(/^M 100 50 L/)
    const parts = result.split('L')
    const midCoords = parts[1].trim().split(' ')
    // Mid-point X should be less than from.x (going left)
    expect(parseFloat(midCoords[0])).toBeLessThan(100)
    expect(result).toContain('20 80')
  })

  it('enforces minimum segment length of 12', () => {
    // When dy - dx * COT_40 would be very small, segLen clamps to 12
    const result = computeElbowPath({ x: 0, y: 0 }, { x: 100, y: 1 }, true)
    const parts = result.split('L')
    const midCoords = parts[1].trim().split(' ')
    // Vertical segment should be at least 12 from origin
    expect(parseFloat(midCoords[1])).toBeGreaterThanOrEqual(12)
  })
})

describe('buildPathD', () => {
  it('returns straight line for default/direct style', () => {
    expect(buildPathD({ x: 0, y: 0 }, { x: 100, y: 100 }, 'direct', false))
      .toBe('M 0 0 L 100 100')
  })

  it('returns straight line for unknown style', () => {
    expect(buildPathD({ x: 5, y: 10 }, { x: 50, y: 60 }, 'unknown', false))
      .toBe('M 5 10 L 50 60')
  })

  it('returns arc for curve-right with sweep=1', () => {
    const result = buildPathD({ x: 0, y: 0 }, { x: 100, y: 0 }, 'curve-right', false)
    expect(result).toMatch(/^M 0 0 A/)
    expect(result).toMatch(/100 0$/)
    // radius = 100 * 0.8 = 80
    expect(result).toContain('A 80 80 0 0 1')
  })

  it('returns arc for curve-left with sweep=0', () => {
    const result = buildPathD({ x: 0, y: 0 }, { x: 100, y: 0 }, 'curve-left', false)
    expect(result).toContain('A 80 80 0 0 0')
  })

  it('computes radius as 0.8× chord length', () => {
    // Distance from (0,0) to (30,40) = 50, so r = 40
    const result = buildPathD({ x: 0, y: 0 }, { x: 30, y: 40 }, 'curve-right', false)
    expect(result).toContain('A 40 40')
  })

  it('delegates to computeElbowPath for elbow style', () => {
    const result = buildPathD({ x: 10, y: 10 }, { x: 50, y: 80 }, 'elbow', true)
    const parts = result.split('L')
    expect(parts).toHaveLength(3)
  })
})

describe('shortenToward', () => {
  it('returns anchor when distance is 0', () => {
    expect(shortenToward({ x: 100, y: 100 }, { x: 0, y: 0 }, 0))
      .toEqual({ x: 100, y: 100 })
  })

  it('returns anchor when distance is negative', () => {
    expect(shortenToward({ x: 100, y: 100 }, { x: 0, y: 0 }, -5))
      .toEqual({ x: 100, y: 100 })
  })

  it('returns anchor when from equals anchor (zero-length vector)', () => {
    expect(shortenToward({ x: 50, y: 50 }, { x: 50, y: 50 }, 10))
      .toEqual({ x: 50, y: 50 })
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

  it('can shorten by more than the vector length', () => {
    // Shortening by more than the length produces a point past the anchor
    const result = shortenToward({ x: 10, y: 0 }, { x: 0, y: 0 }, 20)
    expect(result.x).toBeCloseTo(-10)
  })
})

describe('bboxEdgeToward', () => {
  const bbox = { x: 40, y: 40, width: 20, height: 20 }
  // center is (50, 50)

  it('returns center when target equals center', () => {
    expect(bboxEdgeToward(bbox, 50, 50)).toEqual({ x: 50, y: 50 })
  })

  it('exits from bottom when target is directly below', () => {
    const result = bboxEdgeToward(bbox, 50, 100)
    expect(result.x).toBe(50)
    expect(result.y).toBe(40 + 20 + LINE_PAD)
  })

  it('exits from top when target is directly above', () => {
    const result = bboxEdgeToward(bbox, 50, 0)
    expect(result.x).toBe(50)
    expect(result.y).toBe(40 - LINE_PAD)
  })

  it('exits from right when target is directly right', () => {
    const result = bboxEdgeToward(bbox, 200, 50)
    expect(result.x).toBe(40 + 20 + LINE_PAD)
    expect(result.y).toBe(50)
  })

  it('exits from left when target is directly left', () => {
    const result = bboxEdgeToward(bbox, 0, 50)
    expect(result.x).toBe(40 - LINE_PAD)
    expect(result.y).toBe(50)
  })

  it('chooses closest side when both N/S and E/W are candidates', () => {
    // Target at (55, 200) — within horizontal range so N/S candidate exists
    // and far below, so bottom edge wins
    const result = bboxEdgeToward(bbox, 55, 200)
    expect(result.y).toBe(40 + 20 + LINE_PAD)
  })

  it('falls back to closest midpoint when target is outside both axes', () => {
    // Target at (0, 0) — outside both N/S and E/W zones
    const result = bboxEdgeToward(bbox, 0, 0)
    expect(result.x).toBeDefined()
    expect(result.y).toBeDefined()
    // Should pick top or left midpoint — both are equidistant, top comes first
    expect(result).toEqual({ x: 50, y: 40 - LINE_PAD })
  })

  it('LINE_PAD offsets edges outward', () => {
    expect(LINE_PAD).toBe(4)
  })
})
