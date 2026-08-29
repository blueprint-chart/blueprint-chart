import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { AxisOptions } from '../types'
import { detectDates, type DateGranularity } from '../date-parse'
import { getDefaultTransitionMs } from '../motion'
import { buildNumberFormatter } from '../format-helpers'
import { logTickValues } from '../scale-helpers'
import { measureMaxTextWidth, measureTextWidth } from '../text-measure'

interface AxisDatum {
  placeholder: true
}

const MIN_LABEL_SPACING = 60
// Font size tick labels render at (chart.scss, --bc-axis-tick-font-size).
const TICK_LABEL_FONT_PX = 10
// Gap kept between two neighbouring tick labels.
const TICK_LABEL_GAP = 8
// Floor on the spacing between ticks, so short labels still read as separate.
const MIN_TICK_SPACING = 16
// Deliberately generous px-per-character estimate, and the rotate/wrap
// thresholds below are calibrated against it. Tick density measures the real
// text instead (see labelsThatFit).
const AVG_CHAR_WIDTH_PX = 10
// Labels may visually extend slightly past their per-tick step without being
// unreadable — the char-width estimate is also a loose upper bound. Treat a
// label as "fitting" when it's within this multiple of the per-tick width so
// we don't rotate or wrap on marginal overflow.
const LABEL_FIT_TOLERANCE = 1.3
// Extra padding above/below rotated labels for the tick mark and breathing room.
const ROTATED_LABEL_PADDING_PX = 12
// Default max wrap lines for auto line-breaking of multi-word labels.
// Higher values keep labels upright (readable) more often; rotation is a last resort.
const MAX_WRAP_LINES = 3
// Approximate vertical space per wrap line (matches the 1em tspan dy).
const WRAP_LINE_HEIGHT_PX = 14
// Padding below the axis line before the first wrap line starts.
const WRAP_LABEL_PADDING_PX = 10

/**
 * Wrap a label across multiple lines by splitting on whitespace so each line
 * fits within `maxWidthPx`. Returns `null` when it cannot be made to fit —
 * either because a single word exceeds the width or the content requires more
 * than `maxLines`. Used to avoid rotating labels when wrapping suffices.
 */
function wrapLabel(label: string, maxWidthPx: number, maxLines: number = MAX_WRAP_LINES): string[] | null {
  if (label === '') {
    return ['']
  }
  if (label.length * AVG_CHAR_WIDTH_PX <= maxWidthPx) {
    return [label]
  }
  const words = label.split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    return null
  }
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if (word.length * AVG_CHAR_WIDTH_PX > maxWidthPx) {
      return null
    }
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length * AVG_CHAR_WIDTH_PX <= maxWidthPx) {
      current = candidate
    }
    else {
      lines.push(current)
      current = word
      if (lines.length >= maxLines) {
        return null
      }
    }
  }
  if (current) {
    lines.push(current)
  }
  if (lines.length > maxLines) {
    return null
  }
  return lines
}

const AUTO_DATE_FORMATS: Record<string, string> = {
  year: '%Y',
  month: '%b %Y',
  day: '%b %-d, %Y',
  datetime: '%b %-d, %Y %H:%M',
}

type AnyXScale = d3.ScaleBand<string> | d3.ScalePoint<string> | d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number> | d3.ScaleTime<number, number>

function isOrdinalScale(scale: AnyXScale): scale is d3.ScaleBand<string> | d3.ScalePoint<string> {
  return typeof (scale as d3.ScaleBand<string>).step === 'function'
}

function buildTickFormatter(
  fmt: string | null,
  labels: string[],
): ((d: string | d3.NumberValue) => string) | null {
  const detected = detectDates(labels)

  if (fmt && fmt.includes('%')) {
    // Explicit time format specifier
    if (detected) {
      const timeFmt = d3.timeFormat(fmt)
      // For band scales, we get string domain values — map them to dates
      const dateMap = new Map<string, Date>()
      labels.forEach((l, i) => dateMap.set(l, detected.dates[i]))
      return (d: string | d3.NumberValue) => {
        // For time scales, d is a Date; for band scales, d is a string label
        if (d instanceof Date) {
          return timeFmt(d)
        }
        const date = dateMap.get(String(d))
        return date ? timeFmt(date) : String(d)
      }
    }
    // Format has % but labels aren't parseable dates — ignore
    return null
  }

  if (fmt) {
    // Labels are the band-scale category strings, which a numeric format turns
    // into NaN, so ignore it as the % branch above already does.
    if (labels.length > 0) {
      return null
    }
    // Numeric d3.format
    return (buildNumberFormatter(fmt) ?? d3.format(fmt)) as (d: string | d3.NumberValue) => string
  }

  // No explicit format — auto-format dates if detected
  if (detected) {
    const timeFmt = d3.timeFormat(AUTO_DATE_FORMATS[detected.granularity] ?? '%Y-%m-%d')
    const dateMap = new Map<string, Date>()
    labels.forEach((l, i) => dateMap.set(l, detected.dates[i]))
    return (d: string | d3.NumberValue) => {
      if (d instanceof Date) {
        return timeFmt(d)
      }
      const date = dateMap.get(String(d))
      return date ? timeFmt(date) : String(d)
    }
  }

  return null
}

function maxFormattedLabelWidth(
  domain: string[],
  formatter: ((d: string | d3.NumberValue) => string) | null,
): number {
  let max = 0
  for (const l of domain) {
    const text = formatter ? formatter(l) : l
    const w = text.length * AVG_CHAR_WIDTH_PX
    if (w > max) {
      max = w
    }
  }
  return max
}

function formatLabels(
  domain: (string | d3.NumberValue | Date)[],
  formatter: ((d: string | d3.NumberValue) => string) | null,
): string[] {
  return domain.map(d => formatter ? formatter(d as string | d3.NumberValue) : String(d))
}

/** How many labels of this width fit side by side in `availableWidth`. */
function labelsThatFit(maxLabelWidth: number, availableWidth: number): number {
  const spacing = Math.max(MIN_TICK_SPACING, Math.ceil(maxLabelWidth) + TICK_LABEL_GAP)
  return Math.max(2, Math.floor(availableWidth / spacing))
}

function thinLabels(
  domain: string[],
  availableWidth: number,
  formatter?: ((d: string | d3.NumberValue) => string) | null,
): string[] {
  if (domain.length <= 1) {
    return domain
  }
  const maxLabels = labelsThatFit(
    measureMaxTextWidth(formatLabels(domain, formatter ?? null), TICK_LABEL_FONT_PX),
    availableWidth,
  )
  if (domain.length <= maxLabels) {
    return domain
  }
  const step = Math.ceil(domain.length / maxLabels)
  const kept: number[] = []
  for (let i = 0; i < domain.length; i += step) {
    kept.push(i)
  }
  // Always keep the last label so the axis endpoint (data range end) is visible.
  // It replaces its predecessor when appending it would leave the two closer
  // together than the spacing the rest of the axis was thinned to.
  const lastIndex = domain.length - 1
  if (kept[kept.length - 1] !== lastIndex) {
    if (lastIndex - kept[kept.length - 1] < step) {
      kept.pop()
    }
    kept.push(lastIndex)
  }
  return kept.map(i => domain[i])
}

/**
 * Tick count for a continuous scale, reduced until the formatted labels fit
 * side by side. A count derived from the width alone overprints as soon as the
 * labels are wide: a prefix/suffix format renders `$1,200,000.0M` into a 47px
 * pitch. Each pass asks the scale for its own nice tick values, since the
 * formatted width depends on the step d3 picks.
 */
function fitTickCount(
  scale: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number> | d3.ScaleTime<number, number>,
  availableWidth: number,
  formatter: ((d: string | d3.NumberValue) => string) | null,
): number {
  let count = Math.max(2, Math.floor(availableWidth / MIN_LABEL_SPACING))
  while (count > 2) {
    const ticks = scale.ticks(count)
    const labels = formatLabels(ticks, formatter ?? (scale.tickFormat(count) as (d: string | d3.NumberValue) => string))
    const fits = labelsThatFit(measureMaxTextWidth(labels, TICK_LABEL_FONT_PX), availableWidth)
    if (labels.length <= fits) {
      break
    }
    count = Math.min(count - 1, fits)
  }
  return count
}

/**
 * Decide whether horizontal tick labels should be rotated 90° to avoid overlap.
 * Applies only to ordinal (band/point) scales — time/linear scales thin instead.
 *
 * Ordinal domains of date-parseable labels (e.g. `"2024-01", "2024-02"…`) are
 * treated as continuous: auto mode thins them rather than rotating. An explicit
 * `labelRotation='vertical'` still forces rotation so the user override wins.
 *
 * - `labelRotation='vertical'` → always rotates (when domain has ≥2 entries).
 * - `labelRotation='horizontal'` → never rotates.
 * - `labelRotation='auto'` → rotates when the longest formatted label exceeds
 *   the per-tick band step and the domain is discrete (non-date).
 */
function willRotateLabels(
  domain: string[],
  availableWidth: number,
  labelRotation: string,
  formatter?: ((d: string | d3.NumberValue) => string) | null,
): boolean {
  if (domain.length <= 1 || availableWidth <= 0) {
    return false
  }
  if (labelRotation === 'horizontal') {
    return false
  }
  if (labelRotation === 'vertical') {
    return true
  }
  // 'auto' — continuous (date-like) domains thin instead of rotating.
  if (detectDates(domain)) {
    return false
  }
  const maxWidth = maxFormattedLabelWidth(domain, formatter ?? null)
  const perTickWidth = availableWidth / domain.length
  return maxWidth > perTickWidth * LABEL_FIT_TOLERANCE
}

/**
 * Estimate the pixel height needed below the chart for x-axis labels when
 * rotated 90°. Returns 0 for empty label lists.
 */
function estimateRotatedAxisHeight(
  labels: string[],
  formatter?: ((d: string | d3.NumberValue) => string) | null,
): number {
  if (labels.length === 0) {
    return 0
  }
  const maxWidth = maxFormattedLabelWidth(labels, formatter ?? null)
  return Math.ceil(maxWidth) + ROTATED_LABEL_PADDING_PX
}

/**
 * Estimate the pixel height needed below the chart for wrapped labels.
 * Returns 0 when no label needs more than one line.
 */
function estimateWrappedAxisHeight(wrappedLines: string[][]): number {
  let maxLines = 1
  for (const lines of wrappedLines) {
    if (lines.length > maxLines) {
      maxLines = lines.length
    }
  }
  if (maxLines <= 1) {
    return 0
  }
  return maxLines * WRAP_LINE_HEIGHT_PX + WRAP_LABEL_PADDING_PX
}

/**
 * Resolve the bottom margin needed for the x-axis, accounting for rotation.
 * Returns the rotated height when rotation will apply and it exceeds
 * `defaultBottom`; otherwise undefined (caller keeps its default).
 *
 * Chart types call this before `createCanvas` so the canvas reserves enough
 * space for rotated labels to render within the SVG bounds.
 */
function resolveHorizontalAxisBottom(
  labels: string[],
  availableWidth: number,
  options: {
    labelRotation?: string
    numberFormat?: string | null
    labelPosition?: string
    tickFormat?: ((label: string) => string) | null
  } = {},
  defaultBottom = 24,
): number | undefined {
  if (labels.length === 0 || availableWidth <= 0) {
    return undefined
  }
  // Hidden/inside labels don't need bottom padding — callers already override.
  if (options.labelPosition === 'off' || options.labelPosition === 'inside') {
    return undefined
  }
  const tickFormatter: ((d: string | d3.NumberValue) => string) | null = options.tickFormat
    ? (options.tickFormat as (d: string | d3.NumberValue) => string)
    : buildTickFormatter(options.numberFormat ?? null, labels)
  const labelRotation = options.labelRotation ?? 'auto'
  // Continuous (date-like) domains thin instead of wrapping or rotating, so
  // they need no extra bottom padding. An explicit `vertical` override still
  // rotates and falls through to the rotated-height path below.
  const continuous = labelRotation !== 'vertical' && detectDates(labels) !== null

  if (!continuous && labels.length > 1) {
    const perTick = availableWidth / labels.length
    const fitWidth = perTick * LABEL_FIT_TOLERANCE
    const maxLabelWidth = maxFormattedLabelWidth(labels, tickFormatter)
    const overflows = maxLabelWidth > fitWidth

    if (labelRotation !== 'vertical' && overflows) {
      // Wrap is preferred over rotation when it can fit. Wrap against
      // `fitWidth` (not the strict step) so single words that only marginally
      // overflow are accepted as one line instead of failing wrap and falling
      // through to rotation.
      const wrapped = tryWrapAll(labels, fitWidth, tickFormatter)
      if (wrapped) {
        const wrappedH = estimateWrappedAxisHeight(Array.from(wrapped.values()))
        return wrappedH > defaultBottom ? wrappedH : undefined
      }
    }
  }

  const rotate = willRotateLabels(labels, availableWidth, labelRotation, tickFormatter)
  if (!rotate) {
    return undefined
  }
  const rotatedH = estimateRotatedAxisHeight(labels, tickFormatter)
  return rotatedH > defaultBottom ? rotatedH : undefined
}

/**
 * Attempt to wrap every domain label to fit within `perTickWidth`. Returns a
 * Map keyed by the domain value (what d3-axis binds to each tick's datum),
 * to the wrapped lines. Keying by datum survives d3 transitions that animate
 * text content while `applyWrappedTickLabels` runs synchronously after.
 * Returns `null` when any label cannot be wrapped to fit, or when no label
 * actually needed wrapping (caller should fall back to the non-wrap path).
 */
function tryWrapAll(
  domain: string[],
  perTickWidth: number,
  formatter: ((d: string | d3.NumberValue) => string) | null,
): Map<string, string[]> | null {
  const map = new Map<string, string[]>()
  let anySplit = false
  for (const d of domain) {
    const text = formatter ? formatter(d) : d
    const wrapped = wrapLabel(text, perTickWidth)
    if (wrapped === null) {
      return null
    }
    map.set(d, wrapped)
    if (wrapped.length > 1) {
      anySplit = true
    }
  }
  return anySplit ? map : null
}

/**
 * Replace each tick's single `<text>` content with stacked `<tspan>` lines
 * per the wrap map. Lookup is by the tick's bound datum (d3-axis binds each
 * tick's `__data__` to the domain value), which is stable across re-renders
 * even while a transition is animating the text content. Ticks whose wrap
 * entry is absent or single-line are untouched.
 */
function applyWrappedTickLabels(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: any,
  wrapLinesByDatum: Map<string, string[]>,
): void {
  target.selectAll('.tick').each(function (this: SVGGElement) {
    const tickSel = d3.select(this)
    const datum = tickSel.datum() as unknown
    const key = datum instanceof Date ? datum.toISOString() : String(datum)
    const lines = wrapLinesByDatum.get(key)
    if (!lines || lines.length <= 1) {
      return
    }
    const textEl = tickSel.select<SVGTextElement>('text')
    if (textEl.empty()) {
      return
    }
    // Clear parent `dy` (d3 sets it to 0.71em by default). With tspans, carrying
    // a parent dy can position the first line above the axis baseline in some
    // browsers. We re-apply the baseline offset to the first tspan explicitly.
    textEl.attr('dy', null).text(null)
    lines.forEach((line, i) => {
      textEl.append('tspan')
        .attr('x', 0)
        .attr('dy', i === 0 ? '0.71em' : '1em')
        .text(line)
    })
  })
}

export class HorizontalAxisChart extends D3Blueprint<AxisDatum[]> {
  initialize() {
    this.configDefine('scale', { defaultValue: d3.scaleBand<string>() as AnyXScale })
    this.configDefine('height', { defaultValue: 0 })
    this.configDefine('tickPosition', { defaultValue: 'below' })
    this.configDefine('showAxis', { defaultValue: true })
    this.configDefine('showTicks', { defaultValue: false })
    this.configDefine('gridStyle', { defaultValue: 'dashed' })
    this.configDefine('ticks', { defaultValue: null as unknown[] | null })
    this.configDefine('numberFormat', { defaultValue: null as string | null })
    this.configDefine('width', { defaultValue: 0 })
    this.configDefine('labels', { defaultValue: [] as string[] })
    this.configDefine('labelPosition', { defaultValue: 'auto' })
    this.configDefine('labelRotation', { defaultValue: 'auto' })
    this.configDefine('zeroY', { defaultValue: null as number | null })
    this.configDefine('tickFormat', { defaultValue: null as ((label: string) => string) | null })

    const g = this.base.append('g')

    this.layer('axis', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-axis-horizontal').data(data),
      insert: sel => sel.append('g').attr('class', 'bc-axis bc-axis-horizontal'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          this.applyAxis(sel, 'merge')
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'exit': (sel: any) => {
          sel.remove()
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          this.applyAxis(sel, 'enter')
        },
      },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyAxis(sel: any, phase: 'enter' | 'merge'): void {
    const scale = this.config('scale') as d3.AxisScale<string | d3.NumberValue>
    const rawScale = this.config('scale') as AnyXScale
    const position = this.config('tickPosition') as string
    const height = this.config('height') as number
    const labelPos = this.config('labelPosition') as string
    const labelRotation = this.config('labelRotation') as string
    const availableWidth = this.config('width') as number
    const fmt = this.config('numberFormat') as string | null
    const labels = this.config('labels') as string[]
    const customTickFormat = this.config('tickFormat') as ((label: string) => string) | null

    const axisFn = position === 'above'
      ? d3.axisTop(scale)
      : d3.axisBottom(scale)
    if (!this.config('showTicks')) {
      axisFn.tickSizeOuter(0)
    }

    // Resolve tick formatter first so rotation/thinning can measure formatted width.
    const tickFormatter: ((d: string | d3.NumberValue) => string) | null = customTickFormat
      ? (customTickFormat as (d: string | d3.NumberValue) => string)
      : buildTickFormatter(fmt, labels)
    if (tickFormatter) {
      axisFn.tickFormat(tickFormatter)
    }

    // Rotation only applies to ordinal scales (discrete series). Time/linear
    // scales continue to use the existing thinning strategy. Ordinal domains
    // whose labels parse as dates are treated as continuous — auto mode thins
    // them instead of rotating; only an explicit `vertical` override rotates.
    // For truly discrete labels that overflow their per-tick width, try
    // line-wrapping on whitespace first; only rotate when wrapping can't fit.
    // Discrete labels are NEVER thinned: each label identifies a bar/category,
    // so dropping one makes that bar unreadable. At extreme densities labels
    // are allowed to overlap (visibly broken, but honest) rather than silently
    // disappearing. Thinning applies only to continuous (date-like) domains
    // where each label is a position on a continuous axis, not a category id.
    const ordinal = isOrdinalScale(rawScale)
    const domain = ordinal ? rawScale.domain() : []
    const continuous = ordinal && labelRotation !== 'vertical' && detectDates(domain) !== null
    let wrapLinesByText: Map<string, string[]> | null = null
    let shouldRotate = false

    if (ordinal && !continuous && domain.length > 1 && availableWidth > 0) {
      const perTickWidth = availableWidth / domain.length
      const fitWidth = perTickWidth * LABEL_FIT_TOLERANCE
      const maxLabelWidth = maxFormattedLabelWidth(domain, tickFormatter)
      const overflows = maxLabelWidth > fitWidth

      if (labelRotation === 'vertical') {
        shouldRotate = true
      }
      else if (overflows) {
        wrapLinesByText = tryWrapAll(domain, fitWidth, tickFormatter)
        if (!wrapLinesByText && labelRotation === 'auto') {
          shouldRotate = true
        }
      }
    }

    const effective = labelPos === 'auto' ? 'outside' : labelPos

    let ticks = this.config('ticks') as (string & d3.NumberValue)[] | null
    if (!ticks && availableWidth > 0) {
      if (ordinal) {
        // Continuous (date-like) domains thin to avoid clutter — each label is
        // a position on a continuous axis, not a category identity.
        //
        // Discrete domains keep every label as long as it is legible. Labels
        // that stay horizontal because they can neither wrap nor rotate are
        // thinned as the last step before they would overprint each other:
        // 40 categories at the default settings render one continuous smear,
        // and a smear identifies no bar at all, while a thinned axis still
        // labels one bar in every n and always its first and last.
        const thinnable = continuous || (!shouldRotate && !wrapLinesByText && effective !== 'off')
        if (thinnable) {
          const thinned = thinLabels(domain, availableWidth, tickFormatter)
          if (thinned.length < domain.length) {
            ticks = thinned as (string & d3.NumberValue)[]
          }
        }
      }
      else {
        const maxTicks = Math.max(2, Math.floor(availableWidth / MIN_LABEL_SPACING))
        const decades = logTickValues(rawScale, maxTicks)
        if (decades) {
          ticks = decades as unknown as (string & d3.NumberValue)[]
        }
        else {
          axisFn.ticks(fitTickCount(
            rawScale as d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number> | d3.ScaleTime<number, number>,
            availableWidth,
            tickFormatter,
          ))
        }
      }
    }
    if (ticks) {
      axisFn.tickValues(ticks)
    }

    const translateY = position === 'above' ? 0 : height
    const axisNode = sel.node() as SVGGElement | null

    const ms = phase === 'merge' ? getDefaultTransitionMs() : 0
    if (phase === 'merge') {
      if (!axisNode) {
        return
      }
      if (ms > 0) {
        sel.attr('transform', `translate(0,${translateY})`)
        sel.duration(ms).call(axisFn)
      }
      else {
        d3.select(axisNode)
          .attr('transform', `translate(0,${translateY})`)
          .call(axisFn)
      }
    }
    else {
      sel.attr('transform', `translate(0,${translateY})`)
      sel.call(axisFn)
    }

    // When ms > 0, `sel` is the d3 transition created above; routing downstream
    // label-position writes through it makes those attribute writes part of the
    // same tween so they win against axisBottom's default tick-text positioning.
    // Mirrors the vertical-axis fix from the previous spec (commit 17584357).
    // For ms === 0 (initial render or transitions disabled), use a plain
    // selection on axisNode; falling back to `sel` if axisNode is unexpectedly null.
    const target = ms > 0
      ? sel
      : (axisNode ? d3.select(axisNode) : sel)

    if (!this.config('showAxis')) {
      target.select('.domain').remove()
    }
    else if (phase === 'enter') {
      // Move the domain line to y=0 when the vertical domain crosses zero
      const zeroY = this.config('zeroY') as number | null
      if (zeroY != null) {
        const offset = zeroY - (position === 'above' ? 0 : height)
        target.select('.domain').attr('transform', `translate(0,${offset})`)
      }
    }

    if (!this.config('showTicks')) {
      target.selectAll('.tick line').remove()
    }

    if (effective === 'off') {
      target.selectAll('.tick text').remove()
    }
    else if (effective === 'inside') {
      target.selectAll('.tick text').attr('y', 0).attr('dy', '-0.6em')
    }

    if (shouldRotate && effective !== 'off') {
      // Rotate labels 90° counter-clockwise. End-anchor places the text flush
      // against the tick line; slight x/y nudge clears the tick mark.
      target.selectAll('.tick text')
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'end')
        .attr('x', position === 'above' ? 9 : -9)
        .attr('y', 0)
        .attr('dy', '0.32em')
    }
    else {
      // Ensure a previously-rotated axis resets cleanly on rerender.
      target.selectAll('.tick text')
        .attr('transform', null)

      if (effective !== 'off') {
        clampEdgeLabels(target, availableWidth)
      }
    }

    if (wrapLinesByText && effective !== 'off') {
      applyWrappedTickLabels(target, wrapLinesByText)
    }
  }

  postDraw() {
    const gridStyle = this.config('gridStyle') as string
    const height = this.config('height') as number
    const g = this.base.select('.bc-axis-horizontal').node() as SVGGElement
    if (!g) {
      return
    }

    applyGridLines(g, gridStyle, height)
  }
}

/**
 * A tick sitting at either end of the plot is centred on its own position, so
 * half its label hangs outside. At a narrow width the left margin is only a
 * couple of pixels, so that half is simply chopped off. Anchoring the end
 * labels inward keeps them whole.
 */
function clampEdgeLabels(
  target: d3.Selection<d3.BaseType, unknown, null, undefined>,
  availableWidth: number,
): void {
  if (!(availableWidth > 0)) {
    return
  }
  target.selectAll<SVGTextElement, unknown>('.tick text').each((_d, i, nodes) => {
    const text = nodes[i]
    const tick = text.parentElement as SVGGElement | null
    const x = Number(/translate\(([-\d.]+)/.exec(tick?.getAttribute('transform') ?? '')?.[1] ?? 'NaN')
    if (!Number.isFinite(x)) {
      return
    }
    const half = measureTextWidth(text.textContent ?? '', TICK_LABEL_FONT_PX) / 2
    if (x - half < 0) {
      d3.select(text).attr('text-anchor', 'start')
    }
    else if (x + half > availableWidth) {
      d3.select(text).attr('text-anchor', 'end')
    }
  })
}

// A data join rather than an append, matching the vertical axis: re-renders
// replace the grid instead of stacking a second one, and `none` removes what a
// previous style drew. renderHorizontalAxis used to strip .bc-grid-line by hand
// when handed a prior element, which masked this on that one path only.
function applyGridLines(g: SVGGElement, style: string, height: number): void {
  const root = g.ownerSVGElement?.parentElement ?? document.documentElement
  const cs = getComputedStyle(root)
  const gridColor = cs.getPropertyValue('--bc-grid-color').trim() || '#ccc'
  const data = style === 'none' || height <= 0 ? [] : [null]

  const ticks = d3.select(g).selectAll<SVGGElement, unknown>('.tick')
  ticks.each(function () {
    d3.select(this)
      .selectAll<SVGLineElement, null>('.bc-grid-line')
      .data(data)
      .join('line')
      .attr('class', 'bc-grid-line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', -height)
      .attr('stroke', gridColor)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', GRID_DASH_ARRAY[style] ?? null)
  })
}

const GRID_DASH_ARRAY: Partial<Record<string, string>> = {
  dashed: '4,4',
  dotted: '1,3',
}

export function renderHorizontalAxis(
  chartArea: SVGGElement,
  scale: AnyXScale,
  height: number,
  options: AxisOptions = {},
  priorAxisElement?: Element | null,
): SVGGElement {
  const chart = new HorizontalAxisChart(d3.select(chartArea))

  // Re-insert prior axis element for D3 data-join transition
  if (priorAxisElement) {
    priorAxisElement.querySelectorAll('.bc-grid-line').forEach(el => el.remove())
    const wrapperG = chartArea.lastElementChild
    if (wrapperG) {
      wrapperG.appendChild(priorAxisElement)
    }
  }

  // Extract labels from band scale domain if available
  const labels = isOrdinalScale(scale)
    ? scale.domain()
    : []

  chart.config({
    scale,
    height,
    tickPosition: options.tickPosition ?? 'below',
    showAxis: options.showAxis ?? true,
    showTicks: options.showTicks ?? false,
    gridStyle: options.gridStyle ?? 'dashed',
    ticks: options.ticks ?? null,
    numberFormat: options.numberFormat ?? null,
    width: options.width ?? 0,
    labels,
    labelPosition: options.labelPosition ?? 'auto',
    labelRotation: options.labelRotation ?? 'auto',
    zeroY: options.zeroY ?? null,
    tickFormat: options.tickFormat ?? null,
  })
  chart.draw([{ placeholder: true }])
  return chartArea.querySelector('.bc-axis-horizontal') as SVGGElement
}

export {
  thinLabels,
  buildTickFormatter,
  detectDates,
  willRotateLabels,
  estimateRotatedAxisHeight,
  resolveHorizontalAxisBottom,
  wrapLabel,
}
export type { AnyXScale, DateGranularity }
