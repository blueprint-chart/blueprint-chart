import { describe, expect, it } from 'vitest'
import { parseData } from '../parse-data'
import type { OverlayConfig } from '../types'
import { overlayIssues, resolveOverlays } from './overlays'

const RAW = 'series = "Value","Min","Max","Last"\n"A" = 5,2,8,6\n"B" = 4,1,9,3'

describe('resolveOverlays', () => {
  it('returns data untouched when there are no overlays', () => {
    const data = parseData(RAW)
    expect(resolveOverlays(data, undefined).data).toBe(data)
  })

  it('makes the first column not named by an overlay the bar', () => {
    const d = parseData('series = "Low","Value","High"\n"A" = 1,2,3')
    expect(resolveOverlays(d, [{ columns: ['Low', 'High'] }]).data.values).toEqual([2])
  })

  it('keeps the bar column in series next to unclaimed extras', () => {
    const data = parseData(RAW)
    const r = resolveOverlays(data, [{ columns: ['Min', 'Max'] }])
    expect(r.data.series?.map(s => s.name)).toEqual(['Value', 'Last'])
  })

  it('keeps a hidden overlay\'s columns out of the bars but draws nothing', () => {
    const d = parseData('series = "Low","Value","High"\n"A" = 1,2,3')
    const r = resolveOverlays(d, [{ columns: ['Low', 'High'], hidden: true }])
    expect(r.data.values).toEqual([2])
    expect(r.overlays).toEqual([])
  })

  it('orders low and high per row whatever the column order', () => {
    const data = parseData(RAW)
    const [range] = resolveOverlays(data, [{ columns: ['Max', 'Min'] }]).overlays
    expect(range.low).toEqual([2, 1])
    expect(range.high).toEqual([8, 9])
  })

  it('turns a missing or non-numeric cell into NaN on that row only', () => {
    const data = parseData('series = "Value","Min","Max"\n"A" = 5,2,8\n"B" = 4,1,n/a')
    const [range] = resolveOverlays(data, [{ columns: ['Min', 'Max'] }]).overlays
    expect(range.low[0]).toBe(2)
    expect(range.high[0]).toBe(8)
    expect(range.low[1]).toBeNaN()
    expect(range.high[1]).toBeNaN()
  })

  it('drops an overlay whose column is missing', () => {
    const data = parseData(RAW)
    expect(resolveOverlays(data, [{ columns: ['Gone'] }]).overlays).toEqual([])
  })

  it('removes columns of a dropped overlay from the bars but draws nothing', () => {
    const d = parseData('series = "Low","Value","High"\n"A" = 1,2,3')
    const r = resolveOverlays(d, [{ columns: ['Low', 'Gone'] }])
    expect(r.data.values).toEqual([2])
    expect(r.overlays).toEqual([])
  })

  it('applies defaults', () => {
    const data = parseData(RAW)
    const [range, value] = resolveOverlays(data, [{ columns: ['Last'] }, { columns: ['Min', 'Max'] }]).overlays
    expect(range).toMatchObject({ kind: 'range', title: 'Min to Max', opacity: 0.3, pattern: 'solid', color: 'currentColor' })
    expect(value).toMatchObject({ kind: 'value', title: 'Last', opacity: 1 })
  })

  it('draws ranges before values, DSL order within each group', () => {
    const data = parseData('series = "Value","A","B","C","D"\n"X" = 1,2,3,4,5')
    const overlays = [{ columns: ['A'] }, { columns: ['B', 'C'] }, { columns: ['D'] }]
    const titles = resolveOverlays(data, overlays).overlays.map(o => o.title)
    expect(titles).toEqual(['B to C', 'A', 'D'])
  })
})

describe('resolveOverlays options', () => {
  it('resolves pattern stripes on a range to stripes', () => {
    const [range] = resolveOverlays(parseData(RAW), [{ columns: ['Min', 'Max'], pattern: 'stripes' }]).overlays
    expect(range.pattern).toBe('stripes')
  })

  it('resolves pattern stripes on a value overlay to solid', () => {
    const [value] = resolveOverlays(parseData(RAW), [{ columns: ['Last'], pattern: 'stripes' }]).overlays
    expect(value.pattern).toBe('solid')
  })

  it('lets explicit title, color and opacity override the defaults', () => {
    const config = { columns: ['Min', 'Max'], title: 'Spread', color: '#f00', opacity: 50 }
    const [range] = resolveOverlays(parseData(RAW), [config]).overlays
    expect(range.title).toBe('Spread')
    expect(range.color).toBe('#f00')
    expect(range.opacity).toBe(0.5)
  })
})

describe('overlayIssues', () => {
  const data = parseData(RAW)
  const codes = (issues: { code: string }[]) => issues.map(issue => issue.code)

  it('flags an unsupported chart type', () => {
    const issues = overlayIssues(data, [{ columns: ['Min', 'Max'] }], 'line')
    expect(codes(issues)).toContain('overlay-unsupported-type')
  })

  it('flags an unknown column with a suggestion', () => {
    const issues = overlayIssues(data, [{ columns: ['Mni', 'Max'] }], 'bar-vertical')
    const issue = issues.find(i => i.code === 'overlay-unknown-column')
    expect(issue?.message).toContain('Mni')
    expect(issue?.suggestion).toBe('Min')
  })

  it('flags overlays that leave no bar', () => {
    const issues = overlayIssues(data, [{ columns: ['Value', 'Min'] }, { columns: ['Max', 'Last'] }], 'bar-vertical')
    expect(codes(issues)).toContain('overlay-no-bar')
  })

  it('flags more than two columns', () => {
    const issues = overlayIssues(data, [{ columns: ['Min', 'Max', 'Last'] }], 'bar-vertical')
    expect(codes(issues)).toContain('overlay-too-many-columns')
  })

  it('flags a pattern on a one-column overlay', () => {
    const issues = overlayIssues(data, [{ columns: ['Last'], pattern: 'stripes' }], 'bar-vertical')
    expect(codes(issues)).toContain('overlay-pattern-on-value')
  })

  it('stays quiet for a valid overlay', () => {
    const issues = overlayIssues(data, [{ columns: ['Min', 'Max'] }], 'bar-vertical', RAW)
    expect(issues).toEqual([])
  })

  it('flags a non-numeric cell but not an empty one', () => {
    const raw = 'series = "Value","Min","Max"\n"A" = 5,2,8\n"B" = 4,,n/a'
    const issues = overlayIssues(parseData(raw), [{ columns: ['Min', 'Max'] }], 'bar-vertical', raw)
    const cells = issues.filter(i => i.code === 'overlay-non-numeric-cell')
    expect(cells).toHaveLength(1)
    expect(cells[0].message).toContain('Max')
    expect(cells[0].message).toContain('B')
  })

  it('skips the cell check without raw text', () => {
    const raw = 'series = "Value","Min","Max"\n"A" = 5,2,n/a'
    const issues = overlayIssues(parseData(raw), [{ columns: ['Min', 'Max'] }], 'bar-vertical')
    expect(codes(issues)).not.toContain('overlay-non-numeric-cell')
  })

  it('reads cells by raw column name when transforms shifted the columns', () => {
    const resolved = parseData('series = "Value","Min","Max"\n"A" = 5,2,8')
    const raw = 'series = "Note","Value","Min","Max"\n"A" = "x",5,2,n/a'
    const issues = overlayIssues(resolved, [{ columns: ['Min', 'Max'] }], 'bar-vertical', raw)
    const cells = issues.filter(i => i.code === 'overlay-non-numeric-cell')
    expect(cells).toHaveLength(1)
    expect(cells[0].message).toContain('Max')
  })

  it('does not warn on a neighbouring raw column', () => {
    const resolved = parseData('series = "Value","Min","Max"\n"A" = 5,2,8')
    const raw = 'series = "Note","Value","Min","Max"\n"A" = "hello","world",2,8'
    const issues = overlayIssues(resolved, [{ columns: ['Min', 'Max'] }], 'bar-vertical', raw)
    expect(issues).toEqual([])
  })
})

describe('cue issues', () => {
  const data = parseData('series = "V2","Lo","Hi"\n"A" = 5,2,8\n"B" = 4,1,9')
  const codes = (issues: { code: string }[]) => issues.map(issue => issue.code)
  const run = (configs: OverlayConfig[]) => codes(overlayIssues(data, configs, 'bar-vertical'))

  it('flags muteIfCrosses on a value overlay', () => {
    expect(run([{ columns: ['V2'], muteIfCrosses: 0 }])).toContain('overlay-mute-on-value')
  })

  it.each(['aboveColor', 'belowColor', 'aboveTitle', 'belowTitle'])('flags %s on a range overlay', (key) => {
    expect(run([{ columns: ['Lo', 'Hi'], [key]: 'red' }])).toContain('overlay-target-on-range')
  })

  it('flags a non-numeric muteIfCrosses', () => {
    expect(run([{ columns: ['Lo', 'Hi'], muteIfCrosses: Number.NaN }])).toContain('overlay-mute-not-number')
  })

  it('flags a target title without a color', () => {
    expect(run([{ columns: ['V2'], aboveTitle: 'x' }])).toContain('overlay-title-without-color')
  })

  it('flags a second value overlay with a target color', () => {
    const issues = overlayIssues(data, [{ columns: ['V2'], aboveColor: 'red' }, { columns: ['Lo'], aboveColor: 'blue' }], 'bar-vertical')
    const conflicts = issues.filter(issue => issue.code === 'overlay-target-conflict')
    expect(conflicts.map(issue => issue.key)).toEqual(['overlay[1]'])
  })
})
