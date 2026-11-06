import { SortDirection, renderChart } from '@blueprint-chart/lib'
import type { ChartData, ChartTypeOptions, SeriesOverride } from '@blueprint-chart/lib'
import type { ChartColorize } from './useChartConfig'

// ---------------------------------------------------------------------------
// Offscreen helpers
// ---------------------------------------------------------------------------

/**
 * Inline computed fill and stroke on every SVG element so that CSS-driven
 * colors (class rules, custom properties, currentColor) survive serialization
 * into a standalone SVG data URL with no external CSS context.
 */
function inlineComputedColors(svg: SVGElement): void {
  for (const el of svg.querySelectorAll('*')) {
    if (!(el instanceof SVGElement)) {
      continue
    }
    const cs = globalThis.getComputedStyle(el)

    const computedFill = cs.fill
    if (computedFill && computedFill !== 'none') {
      const raw = el.getAttribute('fill')
      // Inline if no attribute (CSS-only), or if attribute is unresolved
      if (!raw || raw === 'currentColor' || raw.startsWith('var(')) {
        el.setAttribute('fill', computedFill)
      }
    }

    const computedStroke = cs.stroke
    if (computedStroke && computedStroke !== 'none') {
      const raw = el.getAttribute('stroke')
      if (!raw || raw === 'currentColor' || raw.startsWith('var(')) {
        el.setAttribute('stroke', computedStroke)
      }
    }
  }
}

function extractSvg(container: HTMLElement): string | null {
  const svg = container.querySelector('svg')
  if (!svg) {
    return null
  }
  const w = svg.getAttribute('width')
  const h = svg.getAttribute('height')
  if (w && h && !svg.getAttribute('viewBox')) {
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  }
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  if (!svg.getAttribute('xmlns')) {
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  }
  inlineComputedColors(svg)
  return svg.outerHTML
}

// ---------------------------------------------------------------------------
// Offscreen container management
// ---------------------------------------------------------------------------

function withOffscreen(
  id: string,
  width: number,
  height: number | null,
  extraCss: string,
  fn: (container: HTMLElement) => string | null,
): string | null {
  const container = document.createElement('div')
  const heightCss = height ? `height:${height}px;` : ''
  container.style.cssText = `position:fixed;left:-9999px;top:0;width:${width}px;${heightCss}overflow:hidden;`
  container.id = id

  const style = document.createElement('style')
  style.textContent = extraCss

  document.head.appendChild(style)
  document.body.appendChild(container)

  try {
    return fn(container)
  }
  finally {
    document.body.removeChild(container)
    document.head.removeChild(style)
  }
}

// ---------------------------------------------------------------------------
// Thumbnail rendering (chart body only, no frame)
// ---------------------------------------------------------------------------

const THUMB_W = 600
const THUMB_H = 400

const THUMB_CSS = [
  `#__bc_thumb .bc-frame { height:${THUMB_H}px; display:flex; flex-direction:column; }`,
  `#__bc_thumb .bc-frame-header, #__bc_thumb .bc-frame-footer { display:none; }`,
  `#__bc_thumb .bc-frame-body { flex:1; min-height:0; }`,
].join('\n')

export function renderThumbnailSvg(
  chartType: string,
  data: ChartData,
  typeOpts: Partial<ChartTypeOptions>,
  sort: SortDirection,
  options?: { colorizes?: ChartColorize[], seriesOverrides?: SeriesOverride[] },
): string | null {
  if (data.labels.length === 0) {
    return null
  }
  return withOffscreen('__bc_thumb', THUMB_W, THUMB_H, THUMB_CSS, (container) => {
    renderChart(container, {
      chartType,
      data,
      options: typeOpts,
      sort,
      colorizes: options?.colorizes,
      seriesOverrides: options?.seriesOverrides,
    }, { thumbnail: true })
    return extractSvg(container)
  })
}
