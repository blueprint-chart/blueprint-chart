import type { Ref } from 'vue'
import { exportSvg, exportPng, exportFramePng, exportFrameSvg } from '@/utils/export/image'

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

  function downloadSvg() {
    error.value = ''
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
    try {
      const root = getExportRoot()
      if (root) {
        await exportFramePng(root, scale)
        return
      }
      const svg = getSvgElement()
      if (!svg) {
        return
      }
      const { width, height } = svg.getBoundingClientRect()
      await exportPng(svg, width * scale, height * scale)
    }
    catch (e) {
      // A rejected export used to surface nowhere: the button just looked clicked.
      error.value = e instanceof Error ? e.message : String(e)
    }
  }

  return { downloadSvg, downloadPng, error }
}
