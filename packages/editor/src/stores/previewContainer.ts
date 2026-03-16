import { ref } from 'vue'
import type { Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

export const usePreviewContainerStore = defineStore('previewContainer', () => {
  const containerRef = ref<HTMLElement | null>(null) as Ref<HTMLElement | null>

  return { containerRef }
})

export function usePreviewContainer() {
  const store = usePreviewContainerStore()
  return storeToRefs(store)
}
