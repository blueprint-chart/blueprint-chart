import { describe, it, expect } from 'vitest'
import { parseData } from '../../parse-data'
import { ScaleType } from '../../../enums'
import { buildScatterPoints } from './points'

const data = parseData([
  'series = "GDP","Life","Pop","Continent"',
  '"France" = 44000, 82.3, 68, "Europe"',
  '"Chad" = 1500, , 18, "Africa"',
  '"Tiny" = 900, 60, 0, "Africa"',
  '"Zero" = 0, 70, 5, ""',
].join('\n'))
const mapping = { x: 'GDP', y: 'Life', size: 'Pop', group: 'Continent' }

describe('buildScatterPoints', () => {
  it('builds points with every encoding', () => {
    expect(buildScatterPoints(data, mapping, {}).points[0])
      .toEqual({ name: 'France', x: 44000, y: 82.3, size: 68, group: 'Europe' })
  })

  it('reports why a row is dropped', () => {
    expect(buildScatterPoints(data, mapping, {}).dropped).toEqual([
      { name: 'Chad', reason: 'missing-y' },
      { name: 'Tiny', reason: 'invalid-size' },
    ])
  })

  it('keeps a row with an empty group, without a group', () => {
    const zero = buildScatterPoints(data, mapping, {}).points.find(p => p.name === 'Zero')!
    expect(zero.group).toBeUndefined()
  })

  it('drops x <= 0 on a log10 axis but keeps it on symlog', () => {
    expect(buildScatterPoints(data, mapping, { x: ScaleType.Log }).dropped).toContainEqual({ name: 'Zero', reason: 'non-positive-log-x' })
    expect(buildScatterPoints(data, mapping, { x: ScaleType.Symlog }).points.map(p => p.name)).toContain('Zero')
  })

  it('reports every row as missing-y without a y mapping', () => {
    const { points, dropped } = buildScatterPoints(data, { x: 'GDP' }, {})
    expect(points).toEqual([])
    expect(dropped.map(d => d.reason)).toEqual(Array(4).fill('missing-y'))
  })

  it('reads single-series values as the value column', () => {
    const single = parseData('"A" = 3\n"B" = 4')
    expect(buildScatterPoints(single, { x: 'value', y: 'value' }, {}).points[0]).toEqual({ name: 'A', x: 3, y: 3 })
  })
})
