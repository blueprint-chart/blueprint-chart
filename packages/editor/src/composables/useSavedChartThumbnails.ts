import { reactive } from 'vue'
import { storageKey } from '@/stores/chartSession'
import { getThumbnail, renderThumbnailFromStorage, saveThumbnail, svgToDataUrl } from '@/composables/useChartThumbnail'

function render(id: string): string | null {
  const raw = localStorage.getItem(storageKey(id))
  if (!raw) {
    return null
  }
  try {
    const svg = renderThumbnailFromStorage(raw)
    if (svg) {
      saveThumbnail(id, svg)
    }
    return svg
  }
  catch {
    return null
  }
}

export function useSavedChartThumbnails() {
  const thumbnails = reactive<Record<string, string>>({})

  function loadThumbnails(ids: string[]) {
    for (const id of ids) {
      if (thumbnails[id]) {
        continue
      }
      const svg = getThumbnail(id) ?? render(id)
      if (svg) {
        thumbnails[id] = svgToDataUrl(svg)
      }
    }
  }

  return { thumbnails, loadThumbnails }
}
