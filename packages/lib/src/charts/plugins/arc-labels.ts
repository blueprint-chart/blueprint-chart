import * as d3 from 'd3'
import { contrastTextColor, readableColor } from '../contrast'
import { measureTextWidth, measureMaxTextWidth } from '../text-measure'

export interface ArcLabelDatum {
  label: string
  value: number
  startAngle: number
  endAngle: number
  color: string
  percentage?: number
  displayAsPercentage?: boolean
  showLabel?: boolean
  showValue?: boolean
}

// Minimum vertical distance between label centres (two text lines + gap)
const LABEL_GAP = 28

// Length of the radial stub that leaves the arc edge (same for every label)
const STUB_LENGTH = 18

// Length of the horizontal segment that reaches the text (same for every label)
const HORIZONTAL_SEG = 20

// Font size the label text renders at (see renderArcLabels' `fontSize` default).
const LABEL_FONT_PX = 12

// Largest share of a dimension the label columns may claim. Past it the arc
// stops being the chart: labels that overlap or truncate still communicate,
// a radius of zero paints nothing at all.
const MAX_LABEL_MARGIN_SHARE = 0.3

/**
 * Deterministic 1D value spreading.
 * Pushes values apart so consecutive entries are at least `gap` apart,
 * clamped within [top, bottom].  When the available space is too small
 * for `(n-1) * gap`, the effective gap is reduced so labels are evenly
 * distributed across the full range.
 */
export function spreadLabels(naturalYs: number[], top: number, bottom: number, gap: number = LABEL_GAP): number[] {
  if (naturalYs.length === 0) {
    return []
  }
  if (naturalYs.length === 1) {
    return [Math.max(top, Math.min(bottom, naturalYs[0]))]
  }

  const n = naturalYs.length
  const availableSpace = bottom - top
  const requiredSpace = (n - 1) * gap

  // When the available space cannot fit all labels at the requested gap,
  // reduce the gap so labels are evenly distributed.
  const effectiveGap = requiredSpace > availableSpace
    ? Math.max(0, availableSpace / (n - 1))
    : gap

  const ys = [...naturalYs]

  for (let iter = 0; iter < 10; iter++) {
    for (let i = 1; i < ys.length; i++) {
      if (ys[i] - ys[i - 1] < effectiveGap) {
        ys[i] = ys[i - 1] + effectiveGap
      }
    }
    if (ys[ys.length - 1] > bottom) {
      ys[ys.length - 1] = bottom
    }

    for (let i = ys.length - 2; i >= 0; i--) {
      if (ys[i + 1] - ys[i] < effectiveGap) {
        ys[i] = ys[i + 1] - effectiveGap
      }
    }
    if (ys[0] < top) {
      ys[0] = top
    }
  }

  return ys
}

export function renderArcLabels(
  parent: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: ArcLabelDatum[],
  opts: { outerRadius: number, chartWidth: number, chartHeight: number, fontSize?: number, bgColor?: string },
): void {
  const { outerRadius, fontSize = 12, bgColor = '#fff' } = opts

  const anchorR = outerRadius + 2
  const stubR = anchorR + STUB_LENGTH

  // Minimum angular gap between adjacent labels so their text doesn't overlap.
  // LABEL_GAP is the minimum pixel gap; convert to radians at stubR.
  const minAngGap = LABEL_GAP / stubR

  // Split labels into left and right sides based on midAngle
  const left: (ArcLabelDatum & { midAngle: number })[] = []
  const right: (ArcLabelDatum & { midAngle: number })[] = []

  for (const d of data) {
    const midAngle = (d.startAngle + d.endAngle) / 2
    if (midAngle < Math.PI) {
      right.push({ ...d, midAngle })
    }
    else {
      left.push({ ...d, midAngle })
    }
  }

  function renderSide(side: (ArcLabelDatum & { midAngle: number })[], isRight: boolean) {
    if (side.length === 0) {
      return
    }

    // Sort by angle (ascending)
    side.sort((a, b) => a.midAngle - b.midAngle)

    // Spread angles so adjacent labels have at least minAngGap separation.
    // Right side: angles go from ~0 to ~π
    // Left side: angles go from ~π to ~2π
    const angTop = isRight ? 0.05 : Math.PI + 0.05
    const angBottom = isRight ? Math.PI - 0.05 : 2 * Math.PI - 0.05
    const naturalAngs = side.map(d => d.midAngle)
    const resolvedAngs = spreadLabels(naturalAngs, angTop, angBottom, minAngGap)

    const xSign = isRight ? 1 : -1
    const g = parent.append('g').attr('class', 'bc-arc-labels')

    side.forEach((p, i) => {
      const showLabel = p.showLabel !== false
      const showValue = p.showValue !== false
      if (!showLabel && !showValue) {
        return
      }

      // The spread angle determines the label position
      const labelAng = resolvedAngs[i]
      // Convert to math angle (0 = right, counter-clockwise)
      const ang = labelAng - Math.PI / 2

      // Arc anchor on the outer edge at the label angle
      const arcX = Math.cos(ang) * anchorR
      const arcY = Math.sin(ang) * anchorR

      // Stub end: same angle, at stubR (purely radial)
      const stubX = Math.cos(ang) * stubR
      const stubY = Math.sin(ang) * stubR

      // Horizontal segment from stub end outward
      const hEndX = stubX + xSign * HORIZONTAL_SEG

      // 3-point polyline: arc → stub end (radial) → horizontal end
      g.append('polyline')
        .attr('class', 'bc-arc-label-line')
        .attr('points', `${arcX},${arcY} ${stubX},${stubY} ${hEndX},${stubY}`)
        .attr('fill', 'none')
        .attr('stroke', 'var(--bc-text-color, #999)')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5)

      const textX = hEndX + xSign * 4
      const text = g.append('text')
        .attr('class', 'bc-arc-direct-label')
        .attr('x', textX)
        .attr('y', stubY)
        .attr('text-anchor', isRight ? 'start' : 'end')
        .attr('font-size', `${fontSize}px`)

      if (showLabel) {
        text.append('tspan')
          .attr('x', textX)
          .attr('dy', showValue ? '-0.1em' : '0.35em')
          .attr('font-weight', 'bold')
          .attr('fill', readableColor(p.color, bgColor))
          .text(p.label)
      }

      if (showValue) {
        const valueText = p.displayAsPercentage && p.percentage != null
          ? `${Math.round(p.percentage)}%`
          : String(p.value)
        text.append('tspan')
          .attr('x', textX)
          .attr('dy', showLabel ? '1.2em' : '0.35em')
          .attr('fill', 'var(--bc-text-color, #666)')
          .text(valueText)
      }
    })
  }

  renderSide(right, true)
  renderSide(left, false)
}

// Minimum angular span (radians) for a slice to receive an inside label
const MIN_INSIDE_ANGLE = 0.3

export function renderInsideArcLabels(
  parent: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: ArcLabelDatum[],
  opts: { outerRadius: number, innerRadius?: number, chartWidth: number, chartHeight: number, fontSize?: number, bgColor?: string },
): void {
  const { outerRadius, innerRadius = 0, fontSize = 12 } = opts
  const centroidR = (innerRadius + outerRadius) / 2

  const g = parent.append('g').attr('class', 'bc-arc-labels-inside')
  // A slice too narrow to hold its label used to be skipped outright, so a 4%
  // slice was drawn with its name nowhere on the chart. Push it outside, which
  // is what `auto` already does with the same slice.
  const tooNarrow: ArcLabelDatum[] = []

  for (const d of data) {
    const span = d.endAngle - d.startAngle
    if (span < MIN_INSIDE_ANGLE) {
      tooNarrow.push(d)
      continue
    }

    const showLabel = d.showLabel !== false
    const showValue = d.showValue !== false
    if (!showLabel && !showValue) {
      continue
    }

    const midAngle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2
    const cx = Math.cos(midAngle) * centroidR
    const cy = Math.sin(midAngle) * centroidR

    const text = g.append('text')
      .attr('class', 'bc-arc-inside-label')
      .attr('x', cx)
      .attr('y', cy)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', `${fontSize}px`)

    const textColor = contrastTextColor(d.color)

    if (showLabel) {
      text.append('tspan')
        .attr('x', cx)
        .attr('dy', showValue ? '-0.5em' : '0em')
        .attr('font-weight', 'bold')
        .attr('fill', textColor)
        .text(d.label)
    }

    if (showValue) {
      const valueText = d.displayAsPercentage && d.percentage != null
        ? `${Math.round(d.percentage)}%`
        : String(d.value)
      text.append('tspan')
        .attr('x', cx)
        .attr('dy', showLabel ? '1.2em' : '0em')
        .attr('fill', textColor)
        .attr('opacity', 0.85)
        .text(valueText)
    }
  }

  if (tooNarrow.length > 0) {
    renderArcLabels(parent, tooNarrow, {
      outerRadius,
      chartWidth: opts.chartWidth,
      chartHeight: opts.chartHeight,
      fontSize,
      bgColor: opts.bgColor,
    })
  }
}

export function renderAutoArcLabels(
  parent: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: ArcLabelDatum[],
  opts: { outerRadius: number, innerRadius?: number, chartWidth: number, chartHeight: number, fontSize?: number, bgColor?: string },
): void {
  const { outerRadius, innerRadius = 0, fontSize = 12, bgColor } = opts
  const centroidR = (innerRadius + outerRadius) / 2

  const insideData: ArcLabelDatum[] = []
  const outsideData: ArcLabelDatum[] = []

  for (const d of data) {
    const span = d.endAngle - d.startAngle
    const arcWidth = span * centroidR
    const labelWidth = measureTextWidth(d.label, fontSize)
    if (arcWidth > labelWidth * 1.2 && span >= MIN_INSIDE_ANGLE) {
      insideData.push(d)
    }
    else {
      outsideData.push(d)
    }
  }

  if (insideData.length > 0) {
    renderInsideArcLabels(parent, insideData, { outerRadius, innerRadius, chartWidth: opts.chartWidth, chartHeight: opts.chartHeight, fontSize, bgColor })
  }
  if (outsideData.length > 0) {
    renderArcLabels(parent, outsideData, { outerRadius, chartWidth: opts.chartWidth, chartHeight: opts.chartHeight, fontSize, bgColor })
  }
}

/**
 * Estimate extra margins needed for arc labels beyond what the arc already
 * occupies.  The text column sits at outerRadius + STUB_LENGTH + HORIZONTAL_SEG + 6
 * from centre; we need room for the text itself beyond that.
 *
 * `available` is the box the arc has to fit in. The margins are capped against
 * it, because they are subtracted from the canvas with no other lower bound:
 * one long label, a phone-width container or twenty slices otherwise leave a
 * radius of zero and no arcs are painted.
 */
export function estimateArcLabelMargins(
  labels: string[],
  outerRadius: number,
  available: { width: number, height: number } = { width: 0, height: 0 },
): { left: number, right: number, top: number, bottom: number } {
  if (labels.length === 0) {
    return { left: 0, right: 0, top: 0, bottom: 0 }
  }
  // Distance from centre to text column + text gap + text width
  const extension = STUB_LENGTH + HORIZONTAL_SEG + 6 + 4 + measureMaxTextWidth(labels, LABEL_FONT_PX) + 6
  // Vertical: enough room for all labels (worst case: all on one side)
  const neededHalfH = labels.length * LABEL_GAP / 2
  const vertPad = Math.max(10, neededHalfH - outerRadius + 20)
  const horizontal = capMargin(extension, available.width)
  const vertical = capMargin(vertPad, available.height)
  return { left: horizontal, right: horizontal, top: vertical, bottom: vertical }
}

function capMargin(margin: number, available: number): number {
  return available > 0 ? Math.min(margin, available * MAX_LABEL_MARGIN_SHARE) : margin
}
