import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useChartSession } from './useChartSession'
import { useDslOutput } from './useDslOutput'
import { ChartType, SortDirection, parseData, renderBpc, renderChart } from '@blueprint-chart/lib'
import type { ChartData, ChartTypeOptions, SeriesOverride } from '@blueprint-chart/lib'
import type { ChartColorize } from './useChartConfig'

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${globalThis.btoa(unescape(encodeURIComponent(svg)))}`
}

function getResolvedTheme(): string {
  return document.documentElement.getAttribute('data-bs-theme') ?? 'light'
}

const THUMB_KEY = (id: string) => `blueprint-chart:${id}:thumbnail:${getResolvedTheme()}`
const PREVIEW_KEY = (id: string) => `blueprint-chart:${id}:preview:${getResolvedTheme()}`

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

function captureFrameAsSvg(container: HTMLElement): string | null {
  const rootEl = container.querySelector('.bc-frame') as HTMLElement | null
  if (!rootEl) {
    return null
  }
  const svgEl = rootEl.querySelector('svg')
  if (!svgEl) {
    return null
  }

  const rootRect = rootEl.getBoundingClientRect()
  const bgColor = globalThis.getComputedStyle(rootEl).backgroundColor || '#ffffff'

  const textBlocks: { text: string, x: number, y: number, fontSize: number, fontWeight: string, fontFamily: string, fill: string, fontStyle?: string }[] = []
  const textSelectors = '.bc-frame-title, .bc-frame-description, .bc-frame-byline, .bc-frame-source, .bc-frame-credit'
  for (const el of rootEl.querySelectorAll(textSelectors)) {
    const rect = el.getBoundingClientRect()
    if (rect.width === 0) {
      continue
    }
    const cs = globalThis.getComputedStyle(el)
    textBlocks.push({
      text: el.textContent ?? '',
      x: rect.left - rootRect.left,
      y: rect.top - rootRect.top + parseFloat(cs.fontSize),
      fontSize: parseFloat(cs.fontSize),
      fontWeight: cs.fontWeight,
      fontFamily: cs.fontFamily,
      fill: cs.color,
      fontStyle: cs.fontStyle !== 'normal' ? cs.fontStyle : undefined,
    })
  }

  const svgRect = svgEl.getBoundingClientRect()
  const chartX = svgRect.left - rootRect.left
  const chartY = svgRect.top - rootRect.top
  const chartWidth = svgRect.width
  const chartHeight = svgRect.height

  inlineComputedColors(svgEl)
  const svgClone = svgEl.cloneNode(true) as SVGElement
  svgClone.removeAttribute('width')
  svgClone.removeAttribute('height')
  const serializer = new XMLSerializer()
  const chartSvgString = serializer.serializeToString(svgClone)

  const totalWidth = Math.ceil(rootRect.width)
  const totalHeight = Math.ceil(rootRect.height)

  const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const textElements = textBlocks.map(b =>
    `<text x="${b.x}" y="${b.y}" font-size="${b.fontSize}px" font-weight="${b.fontWeight}" font-family="${escapeXml(b.fontFamily)}" fill="${b.fill}"${b.fontStyle ? ` font-style="${b.fontStyle}"` : ''}>${escapeXml(b.text)}</text>`,
  ).join('\n  ')

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${totalWidth} ${totalHeight}">`,
    `  <rect width="100%" height="100%" fill="${bgColor}" />`,
    `  ${textElements}`,
    `  <g transform="translate(${chartX},${chartY})">`,
    `    <svg width="${chartWidth}" height="${chartHeight}"${svgClone.getAttribute('viewBox') ? ` viewBox="${svgClone.getAttribute('viewBox')}"` : ''}>`,
    chartSvgString.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, ''),
    `    </svg>`,
    `  </g>`,
    `</svg>`,
  ].join('\n')
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
  options?: { forceLightTheme?: boolean },
): string | null {
  const container = document.createElement('div')
  const heightCss = height ? `height:${height}px;` : ''
  container.style.cssText = `position:fixed;left:-9999px;top:0;width:${width}px;${heightCss}overflow:hidden;`
  container.id = id

  if (options?.forceLightTheme) {
    container.setAttribute('data-bs-theme', 'light')
  }

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

function dslAllowsDarkMode(dsl: string): boolean {
  const match = dsl.match(/allowDarkMode\s*=\s*(true|false)/)
  return match ? match[1] === 'true' : true
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

function shouldForceLightTheme(dsl: string): boolean {
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark'
  return isDark && !dslAllowsDarkMode(dsl)
}

export function renderThumbnailFromDsl(dsl: string): string | null {
  const forceLight = shouldForceLightTheme(dsl)
  return withOffscreen('__bc_thumb', THUMB_W, THUMB_H, THUMB_CSS, (container) => {
    renderBpc(container, dsl, { thumbnail: true })
    return extractSvg(container)
  }, { forceLightTheme: forceLight })
}

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

// ---------------------------------------------------------------------------
// Preview rendering (full chart with frame)
// ---------------------------------------------------------------------------

const PREVIEW_W = 600
const PREVIEW_H = 500

const PREVIEW_CSS = [
  `#__bc_preview .bc-frame { display:flex; flex-direction:column; }`,
  `#__bc_preview .bc-frame-body { height:${PREVIEW_H}px; min-height:0; }`,
].join('\n')

export function renderPreviewFromDsl(dsl: string): string | null {
  const forceLight = shouldForceLightTheme(dsl)
  return withOffscreen('__bc_preview', PREVIEW_W, null, PREVIEW_CSS, (container) => {
    renderBpc(container, dsl, { padding: '12px' })
    return captureFrameAsSvg(container)
  }, { forceLightTheme: forceLight })
}

// ---------------------------------------------------------------------------
// localStorage cache
// ---------------------------------------------------------------------------

export function getThumbnail(id: string): string | null {
  return localStorage.getItem(THUMB_KEY(id))
}

export function saveThumbnail(id: string, svg: string): void {
  localStorage.setItem(THUMB_KEY(id), svg)
}

export function deleteThumbnail(id: string): void {
  localStorage.removeItem(`blueprint-chart:${id}:thumbnail:light`)
  localStorage.removeItem(`blueprint-chart:${id}:thumbnail:dark`)
  // Clean up legacy un-suffixed key
  localStorage.removeItem(`blueprint-chart:${id}:thumbnail`)
}

export function getPreview(id: string): string | null {
  return localStorage.getItem(PREVIEW_KEY(id))
}

export function savePreview(id: string, svg: string): void {
  localStorage.setItem(PREVIEW_KEY(id), svg)
}

export function deletePreview(id: string): void {
  localStorage.removeItem(`blueprint-chart:${id}:preview:light`)
  localStorage.removeItem(`blueprint-chart:${id}:preview:dark`)
  // Clean up legacy un-suffixed key
  localStorage.removeItem(`blueprint-chart:${id}:preview`)
}

// ---------------------------------------------------------------------------
// Render from raw localStorage entry (legacy JSON or DSL)
// ---------------------------------------------------------------------------

function isLegacyPayload(raw: string): boolean {
  return raw.trimStart().startsWith('{')
}

export function renderThumbnailFromStorage(raw: string): string | null {
  if (!isLegacyPayload(raw)) {
    return renderThumbnailFromDsl(raw)
  }
  const payload = JSON.parse(raw)
  if (!payload.chartConfig) {
    return null
  }
  const { chartConfig, chartTypeOptions } = payload
  const data = parseData(chartConfig.data)
  const singleSeriesTypes: string[] = [ChartType.BarVertical, ChartType.BarHorizontal, ChartType.Line, ChartType.VerticalBar, ChartType.HorizontalBar]
  if (data.series && data.series.length > 0 && singleSeriesTypes.includes(chartConfig.chartType)) {
    const match = data.series.find((s: { name: string }) => s.name === chartConfig.selectedColumn)
    if (match) {
      data.values = match.values
    }
    delete data.series
  }
  const typeOpts = (chartTypeOptions ?? {})[chartConfig.chartType] ?? {}
  return renderThumbnailSvg(chartConfig.chartType, data, typeOpts, chartConfig.sort)
}

export function renderPreviewFromStorage(raw: string): string | null {
  if (!isLegacyPayload(raw)) {
    return renderPreviewFromDsl(raw)
  }
  // Legacy JSON: render via renderDsl is not possible, fall back to thumbnail
  // (legacy payloads lack DSL, so preview = thumbnail)
  return renderThumbnailFromStorage(raw)
}

// ---------------------------------------------------------------------------
// Generate from current editor state
// ---------------------------------------------------------------------------

export function generateThumbnail() {
  const config = useChartConfig()
  const { currentOptions } = useChartTypeOptions()
  const { sessionId } = useChartSession()

  if (!sessionId.value || !config.data.value) {
    return
  }

  const data = parseData(config.data.value)
  const singleSeriesTypes: string[] = [ChartType.BarVertical, ChartType.BarHorizontal, ChartType.Line, ChartType.VerticalBar, ChartType.HorizontalBar]
  if (data.series && data.series.length > 0 && singleSeriesTypes.includes(config.chartType.value)) {
    const match = data.series.find(s => s.name === config.selectedColumn.value)
    if (match) {
      data.values = match.values
    }
    delete data.series
  }

  const svg = renderThumbnailSvg(config.chartType.value, data, currentOptions.value, config.sort.value, {
    colorizes: config.colorizes.value.length > 0 ? config.colorizes.value : undefined,
    seriesOverrides: config.seriesOverrides.value.length > 0 ? config.seriesOverrides.value : undefined,
  })
  if (svg) {
    saveThumbnail(sessionId.value, svg)
  }

  // Preview uses the DSL output for full-frame rendering
  const { generateDsl } = useDslOutput()
  const currentDsl = generateDsl()
  if (currentDsl) {
    const preview = renderPreviewFromDsl(currentDsl)
    if (preview) {
      savePreview(sessionId.value, preview)
    }
  }
}
