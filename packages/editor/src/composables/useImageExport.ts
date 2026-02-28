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

export function useImageExport(containerRef: Ref<HTMLElement | null>) {
  function getSvgElement(): SVGElement | null {
    return containerRef.value?.querySelector('svg') ?? null
  }

  function downloadSvg() {
    const svg = getSvgElement()
    if (svg) exportSvg(svg)
  }

  async function downloadPng() {
    const svg = getSvgElement()
    if (!svg) return
    const { width, height } = svg.getBoundingClientRect()
    await exportPng(svg, width, height)
  }

  return { downloadSvg, downloadPng }
}
