import type { Ref } from 'vue'

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

function serializeSvgToUrl(svgElement: SVGElement): string {
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgElement)
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  return URL.createObjectURL(svgBlob)
}

function renderToCanvas(img: HTMLImageElement, width: number, height: number): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return null
  }
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

function canvasToPngBlob(
  canvas: HTMLCanvasElement,
  onBlob: (blob: Blob | null) => void,
) {
  canvas.toBlob(onBlob, 'image/png')
}

export function exportPng(
  svgElement: SVGElement,
  width: number,
  height: number,
  filename = 'chart.png',
): Promise<void> {
  const url = serializeSvgToUrl(svgElement)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      handleImageLoad(img, width, height, url, filename, resolve, reject)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG image'))
    }
    img.src = url
  })
}

function handleImageLoad(
  img: HTMLImageElement,
  width: number,
  height: number,
  url: string,
  filename: string,
  resolve: () => void,
  reject: (err: Error) => void,
) {
  const canvas = renderToCanvas(img, width, height)
  if (!canvas) {
    URL.revokeObjectURL(url)
    reject(new Error('Could not get canvas context'))
    return
  }
  canvasToPngBlob(canvas, (blob) => {
    URL.revokeObjectURL(url)
    if (!blob) {
      reject(new Error('Could not create PNG blob'))
      return
    }
    triggerDownload(blob, filename)
    resolve()
  })
}

export function useImageExport(containerRef: Ref<HTMLElement | null>) {
  function getSvgElement(): SVGElement | null {
    return containerRef.value?.querySelector('svg') ?? null
  }

  function downloadSvg() {
    const svg = getSvgElement()
    if (svg) {
      exportSvg(svg)
    }
  }

  async function downloadPng() {
    const svg = getSvgElement()
    if (!svg) {
      return
    }
    const { width, height } = svg.getBoundingClientRect()
    await exportPng(svg, width, height)
  }

  return { downloadSvg, downloadPng }
}
