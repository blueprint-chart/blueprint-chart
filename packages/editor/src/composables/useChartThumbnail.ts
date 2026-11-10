import { renderChart, resolveBackgroundColor } from '@blueprint-chart/lib'
import type { ChartDefinition } from '@blueprint-chart/lib'
import { buildChartRender, type RenderSnapshot } from '@/utils/chart/chartRender'

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

export function renderThumbnailSvg(definition: ChartDefinition, theme: 'light' | 'dark'): string | null {
  return withOffscreen('__bc_thumb', THUMB_W, THUMB_H, THUMB_CSS, (container) => {
    container.setAttribute('data-bs-theme', (definition.options?.allowDarkMode ?? true) ? theme : 'light')
    // Thumbnails render frameless, so no .bc-frame carries the themed surface.
    container.style.backgroundColor = 'var(--bs-card-bg)'
    renderChart(container, definition, { thumbnail: true })
    // Baked in so the thumbnail keeps its own theme wherever the tile is shown.
    container.querySelector('svg')?.style.setProperty('background', resolveBackgroundColor(container))
    return extractSvg(container)
  })
}

export function renderSceneThumbnails(snapshot: RenderSnapshot, theme: 'light' | 'dark'): (string | null)[] {
  const indexes = [-1, ...snapshot.scenes.keys()]
  return indexes.map((activeIndex) => {
    const render = buildChartRender({ ...snapshot, activeIndex })
    return render.kind === 'chart' ? renderThumbnailSvg(render.definition, theme) : null
  })
}
