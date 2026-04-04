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

export function exportPng(svgElement: SVGElement, width: number, height: number, filename = 'chart.png'): Promise<void> {
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgElement)
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

/**
 * Inline all computed styles on an element tree so it renders
 * correctly inside an SVG foreignObject (no access to stylesheets).
 */
function inlineStyles(source: Element, target: Element) {
  const computed = globalThis.getComputedStyle(source)
  const el = target as HTMLElement
  if (el.style) {
    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i]
      el.style.setProperty(prop, computed.getPropertyValue(prop))
    }
  }
  const sourceChildren = source.children
  const targetChildren = target.children
  for (let i = 0; i < sourceChildren.length; i++) {
    if (targetChildren[i]) {
      inlineStyles(sourceChildren[i], targetChildren[i])
    }
  }
}

interface CardPadding {
  top: number
  right: number
  bottom: number
  left: number
}

function getCardPadding(el: HTMLElement): CardPadding {
  const cs = globalThis.getComputedStyle(el)
  return {
    top: parseFloat(cs.paddingTop) || 0,
    right: parseFloat(cs.paddingRight) || 0,
    bottom: parseFloat(cs.paddingBottom) || 0,
    left: parseFloat(cs.paddingLeft) || 0,
  }
}

/**
 * Export a full HTML element (e.g. .bc-frame) as PNG by wrapping it
 * in an SVG foreignObject, rendering to canvas, and downloading.
 * Optionally draws a background fill and padding around the content.
 */
export function exportFramePng(
  frameElement: HTMLElement,
  scale = 2,
  filename = 'chart.png',
  bgColor?: string,
  padding?: CardPadding,
): Promise<void> {
  const { width, height } = frameElement.getBoundingClientRect()
  const pad = padding ?? { top: 0, right: 0, bottom: 0, left: 0 }
  const totalWidth = width + pad.left + pad.right
  const totalHeight = height + pad.top + pad.bottom
  const scaledWidth = Math.ceil(totalWidth * scale)
  const scaledHeight = Math.ceil(totalHeight * scale)

  // Clone the frame and inline all computed styles
  const clone = frameElement.cloneNode(true) as HTMLElement
  inlineStyles(frameElement, clone)

  // Remove scene player elements from export
  clone.querySelectorAll('[data-scene-player]').forEach(el => el.remove())

  // Remove pointer-events, transitions, animations from clone
  clone.style.setProperty('pointer-events', 'auto')
  clone.style.setProperty('transition', 'none')
  clone.style.setProperty('animation', 'none')

  const serializer = new XMLSerializer()
  const htmlString = serializer.serializeToString(clone)

  const offsetX = pad.left
  const offsetY = pad.top
  const bgRect = bgColor
    ? `<rect width="${totalWidth}" height="${totalHeight}" fill="${bgColor}" />`
    : ''

  const svgString = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${scaledWidth}" height="${scaledHeight}">`,
    `<g transform="scale(${scale})">`,
    bgRect,
    `<foreignObject x="${offsetX}" y="${offsetY}" width="${width}" height="${height}">`,
    htmlString,
    `</foreignObject>`,
    `</g>`,
    `</svg>`,
  ].join('')

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = scaledWidth
      canvas.height = scaledHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Could not get canvas context'))
        return
      }
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight)
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
      reject(new Error('Failed to render frame as image'))
    }
    img.src = url
  })
}

interface FrameTextBlock {
  text: string
  x: number
  y: number
  fontSize: number
  fontWeight: string
  fontFamily: string
  fill: string
  fontStyle?: string
}

function getTextStyle(el: Element) {
  const cs = globalThis.getComputedStyle(el)
  return {
    fontSize: parseFloat(cs.fontSize),
    fontWeight: cs.fontWeight,
    fontFamily: cs.fontFamily,
    fill: cs.color,
    fontStyle: cs.fontStyle,
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

/**
 * Export a full HTML frame as a pure SVG with text elements for
 * title, description, note, and footer — compatible with all SVG viewers.
 */
export function exportFrameSvg(
  rootElement: HTMLElement,
  filename = 'chart.svg',
) {
  const svgEl = rootElement.querySelector('svg')
  if (!svgEl) {
    return
  }

  const rootRect = rootElement.getBoundingClientRect()
  const bgColor = resolveBackground(rootElement)
  const serializer = new XMLSerializer()

  // Collect header text blocks
  const textBlocks: FrameTextBlock[] = []
  const headerEls = rootElement.querySelectorAll('.bc-frame-title, .bc-frame-description')
  for (const el of headerEls) {
    const rect = el.getBoundingClientRect()
    const style = getTextStyle(el)
    textBlocks.push({
      text: el.textContent ?? '',
      x: rect.left - rootRect.left,
      y: rect.top - rootRect.top + style.fontSize,
      ...style,
    })
  }

  // Collect note
  const noteEl = rootElement.querySelector('.bc-frame-note')
  if (noteEl && noteEl.textContent && (noteEl as HTMLElement).style.display !== 'none') {
    const rect = noteEl.getBoundingClientRect()
    const style = getTextStyle(noteEl)
    textBlocks.push({
      text: noteEl.textContent,
      x: rect.left - rootRect.left,
      y: rect.top - rootRect.top + style.fontSize,
      ...style,
    })
  }

  // Collect footer items (byline, source, credit)
  const footerEls = rootElement.querySelectorAll('.bc-frame-byline, .bc-frame-source, .bc-frame-credit')
  for (const el of footerEls) {
    const rect = el.getBoundingClientRect()
    if (rect.width === 0) {
      continue
    }
    const style = getTextStyle(el)
    textBlocks.push({
      text: el.textContent ?? '',
      x: rect.left - rootRect.left,
      y: rect.top - rootRect.top + style.fontSize,
      ...style,
    })
  }

  // Position the chart SVG
  const svgRect = svgEl.getBoundingClientRect()
  const chartX = svgRect.left - rootRect.left
  const chartY = svgRect.top - rootRect.top
  const chartWidth = svgRect.width
  const chartHeight = svgRect.height

  // Clone the chart SVG and serialize it
  const svgClone = svgEl.cloneNode(true) as SVGElement
  svgClone.removeAttribute('width')
  svgClone.removeAttribute('height')
  const chartSvgString = serializer.serializeToString(svgClone)

  const totalWidth = Math.ceil(rootRect.width)
  const totalHeight = Math.ceil(rootRect.height)

  const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const textElements = textBlocks.map(b =>
    `<text x="${b.x}" y="${b.y}" font-size="${b.fontSize}px" font-weight="${b.fontWeight}" font-family="${escapeXml(b.fontFamily)}" fill="${b.fill}"${b.fontStyle && b.fontStyle !== 'normal' ? ` font-style="${b.fontStyle}"` : ''}>${escapeXml(b.text)}</text>`,
  ).join('\n  ')

  const svgString = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`,
    `  <rect width="100%" height="100%" fill="${bgColor}" />`,
    `  ${textElements}`,
    `  <g transform="translate(${chartX},${chartY})">`,
    `    <svg width="${chartWidth}" height="${chartHeight}"${svgClone.getAttribute('viewBox') ? ` viewBox="${svgClone.getAttribute('viewBox')}"` : ''}>`,
    // Extract inner content of the chart SVG (skip the outer <svg> tag)
    chartSvgString.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, ''),
    `    </svg>`,
    `  </g>`,
    `</svg>`,
  ].join('\n')

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  triggerDownload(blob, filename)
}

export { getCardPadding, resolveBackground }
