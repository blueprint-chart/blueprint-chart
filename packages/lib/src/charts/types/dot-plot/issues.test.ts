import { describe, it, expect } from 'vitest'
import { parseData } from '../../parse-data'
import { dotPlotIssues } from './issues'

const POLLS = parseData('series = "Poll","High","Low"\n"SPD" = 14,16,12')

describe('dotPlotIssues', () => {
  it('warns on a mapping that names a missing column, with a suggestion', () => {
    expect(dotPlotIssues(POLLS, { low: 'Lwo' })).toContainEqual({ code: 'unknown-column', severity: 'warning', key: 'low', message: 'low names "Lwo", which is not a column.', suggestion: 'Low' })
  })
  it('warns on dropped rows', () => {
    const d = parseData('series = "2015","2024"\n"a" = 10,\n"b" = 1,2')
    expect(dotPlotIssues(d, {})).toContainEqual({ code: 'dropped-rows', severity: 'warning', message: '1 row not drawn: "a" (missing value).' })
  })
  it('warns when the value sits outside low to high', () => {
    const d = parseData('series = "Poll","High","Low"\n"a" = 10,9,8\n"b" = 5,6,6.5')
    expect(dotPlotIssues(d, {})).toContainEqual({ code: 'value-outside-range', severity: 'warning', message: '2 rows have a value outside low to high: "a", "b".' })
  })
  it('warns about extra columns ignored in range mode', () => {
    const d = parseData('series = "Poll","Other","High","Low"\n"a" = 1,2,3,0')
    expect(dotPlotIssues(d, {})).toContainEqual({ code: 'ignored-columns', severity: 'warning', message: 'Range mode uses "Poll" as the value and ignores "Other".' })
  })
  it('is silent on clean range data', () => {
    expect(dotPlotIssues(POLLS, {})).toEqual([])
  })
})
