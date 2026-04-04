import type { Ref } from 'vue'

export const usePreviewContainerStore = defineStore('previewContainer', () => {
  const containerRef = ref<HTMLElement | null>(null) as Ref<HTMLElement | null>

  return { containerRef }
})

export function usePreviewContainer() {
  const store = usePreviewContainerStore()
  return storeToRefs(store)
}
