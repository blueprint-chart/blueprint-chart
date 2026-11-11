import { describe, expect, it } from 'vitest'
import { parseData } from '../parse-data'
import type { OverlayConfig } from '../types'
import { barCue, cueLabelFill, overlayIssues, overlayKeyEntries, overlayTooltipFormat, resolveOverlays, stackRowTotals } from './overlays'

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

  it('keeps the key of a shared-column overlay when the first one is hidden', () => {
    const data = parseData(RAW)
    const shown = resolveOverlays(data, [{ columns: ['Last'] }, { columns: ['Last'] }]).overlays
    const afterHide = resolveOverlays(data, [{ columns: ['Last'], hidden: true }, { columns: ['Last'] }]).overlays
    expect(afterHide.map(overlay => overlay.key)).toEqual([shown[1].key])
  })

  it('never gives a shared-column overlay the key of another column', () => {
    const d = parseData('series = "Value","T","T#1"\n"A" = 5,2,8')
    const configs = [{ columns: ['T'] }, { columns: ['T'] }, { columns: ['T#1'] }]
    const keys = resolveOverlays(d, configs).overlays.map(overlay => overlay.key)
    expect(new Set(keys).size).toBe(3)
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

  it.each([
    { aboveTitle: 'x', belowColor: 'red' },
    { belowTitle: 'x', aboveColor: 'red' },
  ])('flags a target title whose own color is missing: %o', (keys) => {
    expect(run([{ columns: ['V2'], ...keys }])).toContain('overlay-title-without-color')
  })

  it('accepts a target title with its own color', () => {
    expect(run([{ columns: ['V2'], aboveTitle: 'x', aboveColor: 'red' }])).not.toContain('overlay-title-without-color')
  })

  it('flags a second value overlay with a target color', () => {
    const issues = overlayIssues(data, [{ columns: ['V2'], aboveColor: 'red' }, { columns: ['Lo'], aboveColor: 'blue' }], 'bar-vertical')
    const conflicts = issues.filter(issue => issue.code === 'overlay-target-conflict')
    expect(conflicts.map(issue => issue.key)).toEqual(['overlay[1]'])
  })
})

describe('barCue', () => {
  const CUE_RAW = 'series = "V","Lo","Hi","T"\n"A" = 5,1,9,5\n"B" = 0,-2,0,1\n"C" = -1,NaN,3,NaN'
  const cues = (overlays: OverlayConfig[], barValues = [5, 0, -1]) => {
    const resolved = resolveOverlays(parseData(CUE_RAW), overlays).overlays
    return barValues.map((value, row) => barCue(resolved, row, value))
  }

  it('fades rows whose range includes the reference, inclusive, never on a missing end', () => {
    const result = cues([{ columns: ['Lo', 'Hi'], muteIfCrosses: 0 }])
    expect(result.map(cue => cue.faded)).toEqual([false, true, false])
  })

  it('never fades without muteIfCrosses', () => {
    const result = cues([{ columns: ['Lo', 'Hi'] }])
    expect(result.map(cue => cue.faded)).toEqual([false, false, false])
  })

  it('colors by target, equal counts as above, missing marker has no color', () => {
    const result = cues([{ columns: ['T'], aboveColor: 'g', belowColor: 'r' }])
    expect(result.map(cue => cue.color)).toEqual(['g', 'r', undefined])
  })

  it('leaves the unset side uncolored', () => {
    const result = cues([{ columns: ['T'], belowColor: 'r' }])
    expect(result[0].color).toBeUndefined()
  })

  it('lets the first value overlay in DSL order decide', () => {
    const raw = 'series = "V","T1","Lo","Hi","T2"\n"A" = 5,5,1,9,5'
    const resolved = resolveOverlays(parseData(raw), [
      { columns: ['T1'], aboveColor: 'first' },
      { columns: ['Lo', 'Hi'] },
      { columns: ['T2'], aboveColor: 'second' },
    ]).overlays
    expect(resolved.map(overlay => overlay.order)).toEqual([1, 0, 2])
    expect(barCue(resolved, 0, 5).color).toBe('first')
  })

  it('never fades for a hidden overlay', () => {
    const result = cues([{ columns: ['Lo', 'Hi'], muteIfCrosses: 0, hidden: true }])
    expect(result.map(cue => cue.faded)).toEqual([false, false, false])
  })
})

describe('overlayKeyEntries', () => {
  const overlays = resolveOverlays(parseData(RAW), [
    { columns: ['Min', 'Max'], title: 'Lo to Hi' },
    { columns: ['Last'], title: 'T', aboveColor: '#00ff00', belowColor: '#ff0000', belowTitle: 'Missed' },
  ]).overlays

  it('puts each cue entry after its overlay', () => {
    const titles = overlayKeyEntries(overlays).map(entry => entry.title)
    expect(titles).toEqual(['Lo to Hi', 'T', 'Above T', 'Missed'])
  })

  it('drops overlay entries when direct labels carry them', () => {
    const titles = overlayKeyEntries(overlays, false).map(entry => entry.title)
    expect(titles).toEqual(['Above T', 'Missed'])
  })
})

describe('overlay families', () => {
  const MEDALS = 'series = "Gold low","Gold","Gold high","Silver"\n"A" = 1,2,3,4'
  const range = (extra: Partial<OverlayConfig> = {}): OverlayConfig => ({ columns: ['Gold low', 'Gold high'], ...extra })
  const codes = (issues: { code: string }[]) => issues.map(issue => issue.code)

  it('targets the first remaining series on a series type without bar', () => {
    const r = resolveOverlays(parseData(MEDALS), [range()], 'bar-multi')
    expect(r.data.series?.map(s => s.name)).toEqual(['Gold', 'Silver'])
    expect(r.overlays[0].bar).toBe('Gold')
  })

  it('targets the named series, falling back on an unknown one', () => {
    const silver = resolveOverlays(parseData(MEDALS), [range({ bar: 'Silver' })], 'bar-multi')
    const bronze = resolveOverlays(parseData(MEDALS), [range({ bar: 'Bronze' })], 'bar-multi')
    expect(silver.overlays[0].bar).toBe('Silver')
    expect(bronze.overlays[0].bar).toBe('Gold')
  })

  it('keeps a single remaining column as series on a stacked type, without bar', () => {
    const d = parseData('series = "Gold low","Gold","Gold high"\n"A" = 1,2,3')
    const r = resolveOverlays(d, [range({ bar: 'Gold' })], 'bar-stacked')
    expect(r.data.series?.map(s => s.name)).toEqual(['Gold'])
    expect(r.overlays[0].bar).toBeUndefined()
  })

  it('drops every overlay on a percent stack but still claims its columns', () => {
    const r = resolveOverlays(parseData(MEDALS), [range()], 'bar-stacked', 'percent')
    expect(r.overlays).toEqual([])
    expect(r.data.series?.map(s => s.name)).toEqual(['Gold', 'Silver'])
  })

  it('flags a missing bar on a series type', () => {
    expect(codes(overlayIssues(parseData(MEDALS), [range()], 'bar-multi'))).toContain('overlay-bar-missing')
  })

  it('flags an unknown bar with a suggestion', () => {
    const issues = overlayIssues(parseData(MEDALS), [range({ bar: 'Silvr' })], 'bar-multi')
    const issue = issues.find(i => i.code === 'overlay-bar-unknown')
    expect(issue?.suggestion).toBe('Silver')
  })

  it.each(['bar-vertical', 'bar-stacked'])('flags bar as ignored on %s', (chartType) => {
    expect(codes(overlayIssues(parseData(MEDALS), [range({ bar: 'Gold' })], chartType))).toContain('overlay-bar-ignored')
  })

  it('flags overlays on a percent stack', () => {
    expect(codes(overlayIssues(parseData(MEDALS), [range()], 'column-stacked', undefined, 'percent'))).toContain('overlay-percent-stack')
  })

  it('stays quiet for a series overlay naming a bar', () => {
    expect(overlayIssues(parseData(MEDALS), [range({ bar: 'Gold' })], 'bar-grouped')).toEqual([])
  })

  it('only conflicts colored value overlays on the same bar', () => {
    const d = parseData('series = "Gold","Silver","T1","T2"\n"A" = 1,2,3,4')
    const apart = [{ columns: ['T1'], bar: 'Gold', aboveColor: 'g' }, { columns: ['T2'], bar: 'Silver', aboveColor: 'g' }]
    const together = [{ columns: ['T1'], bar: 'Gold', aboveColor: 'g' }, { columns: ['T2'], aboveColor: 'g' }]
    expect(codes(overlayIssues(d, apart, 'bar-multi'))).not.toContain('overlay-target-conflict')
    expect(codes(overlayIssues(d, together, 'bar-multi'))).toContain('overlay-target-conflict')
  })
})

describe('cueLabelFill', () => {
  it('uses currentColor on a faded bar', () => {
    expect(cueLabelFill({ faded: true }, false, '#000000')).toBe('currentColor')
  })

  it('contrasts against the cue color unless the bar is colorized', () => {
    const cue = { faded: false, color: '#ffffff' }
    expect(cueLabelFill(cue, false, '#000000')).toBe(cueLabelFill({ faded: false }, false, '#ffffff'))
    expect(cueLabelFill(cue, true, '#000000')).toBe(cueLabelFill({ faded: false }, false, '#000000'))
  })
})

describe('stackRowTotals', () => {
  it('sums every series per row, negatives included', () => {
    const series = [{ values: [6, 1] }, { values: [-2, 1] }]
    expect(stackRowTotals(series, 2)).toEqual([4, 2])
  })
})

describe('overlayTooltipFormat', () => {
  const raw = 'series = "A","B","Goal"\n"X" = 5,7,15'

  it('lists an overlay only on the bar it targets', () => {
    const data = parseData(raw)
    const { overlays } = resolveOverlays(data, [{ columns: ['Goal'], bar: 'A', title: 'Target' }], 'bar-grouped')
    const format = overlayTooltipFormat(overlays, data.labels)!
    expect(format({ label: 'X', value: 5, seriesName: 'A' })).toContain('Target: 15')
    expect(format({ label: 'X', value: 7, seriesName: 'B' })).not.toContain('Target')
  })

  it('lists every overlay when the chart has no target bars', () => {
    const data = parseData(raw)
    const { overlays } = resolveOverlays(data, [{ columns: ['Goal'], title: 'Target' }], 'bar-stacked')
    const format = overlayTooltipFormat(overlays, data.labels)!
    expect(format({ label: 'X', value: 5, seriesName: 'B' })).toContain('Target: 15')
  })
})
