import { describe, it, expect } from 'vitest'
import { parseData } from '../../parse-data'
import { ScaleType } from '../../../enums'
import { scatterIssues } from './issues'

const data = parseData([
  'series = "GDP","Life","Pop","Continent"',
  '"France" = 44000, 82.3, 68, "Europe"',
  '"Chad" = 1500, , 18, "Africa"',
  '"Tiny" = 900, 60, 0, "Africa"',
].join('\n'))

const codes = (issues: { code: string }[]) => issues.map(i => i.code)

describe('scatterIssues', () => {
  it('reports a mapping that names no column, with a suggestion', () => {
    expect(scatterIssues(data, { x: 'GPD' }, {}, {})).toContainEqual({
      code: 'unknown-column',
      severity: 'error',
      key: 'x',
      message: 'x names "GPD", which is not a column.',
      suggestion: 'GDP',
    })
  })

  it('covers size and group too', () => {
    const keys = scatterIssues(data, { size: 'Popp', group: 'Nope' }, {}, {}).map(i => i.key)
    expect(keys).toEqual(['size', 'group'])
  })

  it('accepts none and empty overrides', () => {
    expect(codes(scatterIssues(data, { size: 'none', group: '' }, {}, {}))).not.toContain('unknown-column')
  })

  it('needs two numeric columns', () => {
    const single = parseData('"a" = 1\n"b" = 2')
    expect(scatterIssues(single, {}, {}, {})).toEqual([
      { code: 'scatter-missing-y', severity: 'error', key: 'y', message: 'Scatter needs at least two numeric columns.' },
    ])
  })

  it('lists dropped rows with plural copy', () => {
    const issue = scatterIssues(data, {}, {}, {}).find(i => i.code === 'dropped-rows')
    expect(issue).toMatchObject({
      severity: 'warning',
      message: '2 rows not drawn: "Chad" (missing y), "Tiny" (size must be above 0).',
    })
  })

  it('uses singular copy for one row', () => {
    const one = parseData('series = "a","b"\n"Chad" = 1,\n"Ok" = 1, 2')
    expect(scatterIssues(one, {}, {}, {}).find(i => i.code === 'dropped-rows')?.message)
      .toBe('1 row not drawn: "Chad" (missing y).')
  })

  it('caps the list at five names', () => {
    const rows = Array.from({ length: 7 }, (_, i) => `"r${i}" = 1,`).join('\n')
    const message = scatterIssues(parseData(`series = "a","b"\n${rows}\n"Ok" = 1, 2`), {}, {}, {})
      .find(i => i.code === 'dropped-rows')!.message
    expect(message).toBe('7 rows not drawn: "r0" (missing y), "r1" (missing y), "r2" (missing y), "r3" (missing y), "r4" (missing y), and 2 more.')
  })

  it('explains log axis drops', () => {
    const zero = parseData('series = "a","b"\n"Z" = 0, 1\n"Ok" = 1, 2')
    expect(scatterIssues(zero, {}, { x: ScaleType.Log }, {}).find(i => i.code === 'dropped-rows')?.message)
      .toBe('1 row not drawn: "Z" (x must be above 0 on a log axis).')
  })

  it('warns when a trend cannot be fitted', () => {
    const messages = scatterIssues(data, {}, {}, {}, 'per-group').filter(i => i.code === 'trend-skipped').map(i => i.message)
    expect(messages).toEqual(['Trend line skipped for Europe: needs at least 3 points.'])
    expect(scatterIssues(data, {}, {}, {}, 'overall').find(i => i.code === 'trend-skipped')?.message)
      .toBe('Trend line skipped: needs at least 3 points.')
  })

  it('warns about a log range bound at or below zero', () => {
    const issues = scatterIssues(data, {}, { x: ScaleType.Log }, { x: { min: '0' } })
    expect(issues.find(i => i.code === 'log-range-ignored')).toMatchObject({
      severity: 'warning',
      message: 'horizontalRangeMin must be above 0 on a log axis; it is ignored.',
    })
  })

  it('does not warn about an empty log range bound', () => {
    expect(codes(scatterIssues(data, {}, { x: ScaleType.Log }, { x: { min: '', max: ' ' } }))).not.toContain('log-range-ignored')
  })

  it('skips row checks when the mapping is broken', () => {
    expect(codes(scatterIssues(data, { x: 'GPD' }, {}, {}, 'overall'))).toEqual(['unknown-column'])
  })
})
