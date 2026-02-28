import { ref } from 'vue'
import type { Ref } from 'vue'

const containerRef = ref<HTMLElement | null>(null) as Ref<HTMLElement | null>

export function usePreviewContainer() {
  return { containerRef }
}
