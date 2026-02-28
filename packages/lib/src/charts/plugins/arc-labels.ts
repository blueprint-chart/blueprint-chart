import * as d3 from 'd3'
import { contrastTextColor, readableColor } from '../contrast'

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

/**
 * Deterministic 1D value spreading.
 * Pushes values apart so consecutive entries are at least `gap` apart,
 * clamped within [top, bottom].
 */
export function spreadLabels(naturalYs: number[], top: number, bottom: number, gap: number = LABEL_GAP): number[] {
  if (naturalYs.length === 0) {
    return []
  }
  if (naturalYs.length === 1) {
    return [Math.max(top, Math.min(bottom, naturalYs[0]))]
  }

  const ys = [...naturalYs]

  for (let iter = 0; iter < 10; iter++) {
    for (let i = 1; i < ys.length; i++) {
      if (ys[i] - ys[i - 1] < gap) {
        ys[i] = ys[i - 1] + gap
      }
    }
    if (ys[ys.length - 1] > bottom) {
      ys[ys.length - 1] = bottom
    }

    for (let i = ys.length - 2; i >= 0; i--) {
      if (ys[i + 1] - ys[i] < gap) {
        ys[i] = ys[i + 1] - gap
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
  const { outerRadius, fontSize = 11, bgColor = '#fff' } = opts

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
        .attr('stroke', '#999')
        .attr('stroke-width', 1)

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
          .attr('fill', '#666')
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
  opts: { outerRadius: number, innerRadius?: number, chartWidth: number, chartHeight: number, fontSize?: number },
): void {
  const { outerRadius, innerRadius = 0, fontSize = 11 } = opts
  const centroidR = (innerRadius + outerRadius) / 2

  const g = parent.append('g').attr('class', 'bc-arc-labels-inside')

  for (const d of data) {
    const span = d.endAngle - d.startAngle
    if (span < MIN_INSIDE_ANGLE) {
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
}

export function renderAutoArcLabels(
  parent: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: ArcLabelDatum[],
  opts: { outerRadius: number, innerRadius?: number, chartWidth: number, chartHeight: number, fontSize?: number, bgColor?: string },
): void {
  const { outerRadius, innerRadius = 0, fontSize = 11, bgColor } = opts
  const centroidR = (innerRadius + outerRadius) / 2

  const insideData: ArcLabelDatum[] = []
  const outsideData: ArcLabelDatum[] = []

  for (const d of data) {
    const span = d.endAngle - d.startAngle
    const arcWidth = span * centroidR
    const labelWidth = d.label.length * 7
    if (arcWidth > labelWidth * 1.2 && span >= MIN_INSIDE_ANGLE) {
      insideData.push(d)
    }
    else {
      outsideData.push(d)
    }
  }

  if (insideData.length > 0) {
    renderInsideArcLabels(parent, insideData, { outerRadius, innerRadius, chartWidth: opts.chartWidth, chartHeight: opts.chartHeight, fontSize })
  }
  if (outsideData.length > 0) {
    renderArcLabels(parent, outsideData, { outerRadius, chartWidth: opts.chartWidth, chartHeight: opts.chartHeight, fontSize, bgColor })
  }
}

/**
 * Estimate extra margins needed for arc labels beyond what the arc already
 * occupies.  The text column sits at outerRadius + STUB_LENGTH + HORIZONTAL_SEG + 6
 * from centre; we need room for the text itself beyond that.
 */
export function estimateArcLabelMargins(labels: string[], outerRadius: number): { left: number, right: number, top: number, bottom: number } {
  if (labels.length === 0) {
    return { left: 0, right: 0, top: 0, bottom: 0 }
  }
  const maxLen = Math.max(...labels.map(l => l.length))
  // Distance from centre to text column + text gap + text width
  const extension = STUB_LENGTH + HORIZONTAL_SEG + 6 + 4 + maxLen * 7 + 6
  // Vertical: enough room for all labels (worst case: all on one side)
  const maxSide = labels.length
  const neededHalfH = maxSide * LABEL_GAP / 2
  const vertPad = Math.max(10, neededHalfH - outerRadius + 20)
  return { left: extension, right: extension, top: vertPad, bottom: vertPad }
}
