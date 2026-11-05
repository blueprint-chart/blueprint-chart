import { describe, it, expect } from 'vitest'
import type { ScatterPoint } from './points'
import { highlightedPointNames, resolvePointColor, splitColorOverrides } from './emphasis'

const pts = [
  { name: 'Chad', x: 1, y: 1, group: 'Africa' },
  { name: 'Mali', x: 2, y: 2, group: 'Africa' },
  { name: 'Africa', x: 3, y: 3, group: 'Other' },
] as ScatterPoint[]

describe('scatter emphasis', () => {
  it('selects a whole group by name', () => {
    expect(highlightedPointNames(pts.slice(0, 2), ['Africa'])).toEqual(new Set(['Chad', 'Mali']))
  })

  it('lets a point name beat a group name', () => {
    expect(highlightedPointNames(pts, ['Africa'])).toEqual(new Set(['Africa']))
  })

  it('applies point override before group color', () => {
    const groups = new Map([['Africa', '#a']])
    expect(resolvePointColor(pts[0], new Map([['Chad', '#c']]), groups, '#f')).toBe('#c')
    expect(resolvePointColor(pts[1], new Map([['Chad', '#c']]), groups, '#f')).toBe('#a')
  })

  it('splits colorize targets into point and group overrides', () => {
    const { points, groups } = splitColorOverrides(pts.slice(0, 2), new Map([['Africa', '#a'], ['Chad', '#c']]))
    expect(points).toEqual(new Map([['Chad', '#c']]))
    expect(groups).toEqual(new Map([['Africa', '#a']]))
  })

  it('treats a target matching a point and a group as a point override only', () => {
    const { points, groups } = splitColorOverrides(pts, new Map([['Africa', '#a']]))
    expect(points).toEqual(new Map([['Africa', '#a']]))
    expect(groups).toEqual(new Map())
  })

  it('falls back to the group color, then the fallback', () => {
    const groups = new Map([['Africa', '#g']])
    expect(resolvePointColor(pts[0], new Map(), groups, '#f')).toBe('#g')
    expect(resolvePointColor({ name: 'Solo', x: 0, y: 0 }, new Map(), groups, '#f')).toBe('#f')
  })
})
