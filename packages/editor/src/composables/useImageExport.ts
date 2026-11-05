import type { Ref } from 'vue'
import { exportSvg, exportPng, exportFramePng, exportFrameSvg } from '@/utils/export/image'

const NO_CHART_MESSAGE = 'There\'s no chart to export yet. Add data first.'
const PNG_FAILED_MESSAGE = 'Couldn\'t create the PNG. Try a smaller scale, or download SVG instead.'

export function useImageExport(containerRef: Ref<HTMLElement | null>, cardRef?: Ref<HTMLElement | null>) {
  const error = shallowRef('')

  function getSvgElement(): SVGElement | null {
    return containerRef.value?.querySelector('svg') ?? null
  }

  function getFrameElement(): HTMLElement | null {
    return containerRef.value?.querySelector('.bc-frame') ?? null
  }

  // The card wraps the frame with the export canvas padding and background, so
  // measuring it keeps both downloads matching what the preview shows.
  function getExportRoot(): HTMLElement | null {
    return cardRef?.value ?? getFrameElement()
  }

  function hasChart(): boolean {
    const root = getExportRoot()
    return Boolean(root ? root.querySelector('svg') : getSvgElement())
  }

  function downloadSvg() {
    error.value = ''
    if (!hasChart()) {
      error.value = NO_CHART_MESSAGE
      return
    }
    const root = getExportRoot()
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
    error.value = ''
    if (!hasChart()) {
      error.value = NO_CHART_MESSAGE
      return
    }
    try {
      const root = getExportRoot()
      if (root) {
        await exportFramePng(root, scale)
        return
      }
      const svg = getSvgElement()!
      const { width, height } = svg.getBoundingClientRect()
      await exportPng(svg, width * scale, height * scale)
    }
    catch (e) {
      console.error(e)
      error.value = PNG_FAILED_MESSAGE
    }
  }

  return { downloadSvg, downloadPng, error }
}
