import type { Ref } from 'vue'
import {
  exportSvg,
  exportPng,
  exportFramePng,
  exportFrameSvg,
  getCardPadding,
  resolveBackground,
} from '@/utils/export/image'

export function useImageExport(containerRef: Ref<HTMLElement | null>, cardRef?: Ref<HTMLElement | null>) {
  function getSvgElement(): SVGElement | null {
    return containerRef.value?.querySelector('svg') ?? null
  }

  function getFrameElement(): HTMLElement | null {
    return containerRef.value?.querySelector('.bc-frame') ?? null
  }

  function downloadSvg() {
    // SVG uses pure text extraction — card ref includes padding & background
    const root = cardRef?.value ?? getFrameElement()
    if (root) {
      exportFrameSvg(root)
      return
    }
    const svg = getSvgElement()
    if (svg) {
      exportSvg(svg)
    }
  }

  async function downloadPng(scale = 2) {
    // PNG uses foreignObject — target .bc-frame (card styles break foreignObject)
    const frame = getFrameElement()
    if (frame) {
      const bgColor = cardRef?.value ? resolveBackground(cardRef.value) : undefined
      const padding = cardRef?.value ? getCardPadding(cardRef.value) : undefined
      await exportFramePng(frame, scale, 'chart.png', bgColor, padding)
      return
    }
    const svg = getSvgElement()
    if (!svg) {
      return
    }
    const { width, height } = svg.getBoundingClientRect()
    await exportPng(svg, width * scale, height * scale)
  }

  return { downloadSvg, downloadPng }
}
