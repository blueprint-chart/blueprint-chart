import { buildFrameSvg } from '@blueprint-chart/lib'
import type { ChartAccessibility, FrameSvgLayout, FrameSvgTextBlock } from '@blueprint-chart/lib'

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportSvg(svgElement: SVGElement, filename = 'chart.svg') {
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgElement)
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  triggerDownload(blob, filename)
}

function rasterize(svgString: string, width: number, height: number, filename: string): Promise<void> {
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Could not get canvas context'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url)
        if (!blob) {
          reject(new Error('Could not create PNG blob'))
          return
        }
        triggerDownload(blob, filename)
        resolve()
      }, 'image/png')
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG image'))
    }
    img.src = url
  })
}

export function exportPng(svgElement: SVGElement, width: number, height: number, filename = 'chart.png'): Promise<void> {
  const serializer = new XMLSerializer()
  return rasterize(serializer.serializeToString(svgElement), width, height, filename)
}

function getTextStyle(el: Element) {
  const cs = globalThis.getComputedStyle(el)
  return {
    fontSize: parseFloat(cs.fontSize),
    fontWeight: cs.fontWeight,
    fontFamily: cs.fontFamily,
    fill: cs.color,
    fontStyle: cs.fontStyle !== 'normal' ? cs.fontStyle : undefined,
  }
}

function resolveBackground(el: HTMLElement): string {
  let current: HTMLElement | null = el
  while (current) {
    const bg = globalThis.getComputedStyle(current).backgroundColor
    // Skip transparent / rgba(..., 0) backgrounds
    if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
      return bg
    }
    current = current.parentElement
  }
  return '#ffffff'
}

const FRAME_TEXT_SELECTORS = '.bc-frame-title, .bc-frame-description, .bc-frame-note, .bc-frame-byline, .bc-frame-source, .bc-frame-credit'

function readAccessibility(svgEl: SVGElement): ChartAccessibility {
  return {
    label: svgEl.getAttribute('aria-label') ?? '',
    description: svgEl.querySelector('desc')?.textContent ?? '',
  }
}

/**
 * Measure the live frame and describe it as an SVG layout. The browser owns the
 * real text metrics here, so positions come from getBoundingClientRect rather
 * than from the headless estimator, but both feed the same emitter.
 */
function measureFrameLayout(rootElement: HTMLElement, svgEl: SVGElement): { layout: FrameSvgLayout, plot: string } {
  const rootRect = rootElement.getBoundingClientRect()
  const blocks: FrameSvgTextBlock[] = []
  for (const el of rootElement.querySelectorAll(FRAME_TEXT_SELECTORS)) {
    const rect = el.getBoundingClientRect()
    if (rect.width === 0) {
      continue
    }
    const style = getTextStyle(el)
    blocks.push({
      text: el.textContent ?? '',
      x: rect.left - rootRect.left,
      y: rect.top - rootRect.top + style.fontSize,
      ...style,
    })
  }

  const svgRect = svgEl.getBoundingClientRect()
  const svgClone = svgEl.cloneNode(true) as SVGElement
  svgClone.setAttribute('width', String(svgRect.width))
  svgClone.setAttribute('height', String(svgRect.height))
  const serializer = new XMLSerializer()

  return {
    layout: {
      width: Math.ceil(rootRect.width),
      height: Math.ceil(rootRect.height),
      plot: {
        x: svgRect.left - rootRect.left,
        y: svgRect.top - rootRect.top,
        width: svgRect.width,
        height: svgRect.height,
      },
      blocks,
      background: resolveBackground(rootElement),
      color: globalThis.getComputedStyle(rootElement).color || '#333333',
      fontFamily: globalThis.getComputedStyle(rootElement).fontFamily || 'sans-serif',
    },
    plot: serializer.serializeToString(svgClone),
  }
}

/**
 * Build a standalone SVG of the whole frame: chrome as native `<text>`, chart
 * nested as SVG. No `foreignObject`, so the result rasterises without tainting
 * a canvas.
 */
export function buildFrameSvgFromDom(rootElement: HTMLElement): { markup: string, width: number, height: number } | null {
  const svgEl = rootElement.querySelector('svg')
  if (!svgEl) {
    return null
  }
  const { layout, plot } = measureFrameLayout(rootElement, svgEl)
  return {
    markup: buildFrameSvg(layout, plot, readAccessibility(svgEl)),
    width: layout.width,
    height: layout.height,
  }
}

export function exportFrameSvg(rootElement: HTMLElement, filename = 'chart.svg') {
  const built = buildFrameSvgFromDom(rootElement)
  if (!built) {
    return
  }
  triggerDownload(new Blob([built.markup], { type: 'image/svg+xml;charset=utf-8' }), filename)
}

export function exportFramePng(
  rootElement: HTMLElement,
  scale = 2,
  filename = 'chart.png',
): Promise<void> {
  const built = buildFrameSvgFromDom(rootElement)
  if (!built) {
    return Promise.reject(new Error('No chart to export'))
  }
  return rasterize(
    built.markup,
    Math.ceil(built.width * scale),
    Math.ceil(built.height * scale),
    filename,
  )
}
