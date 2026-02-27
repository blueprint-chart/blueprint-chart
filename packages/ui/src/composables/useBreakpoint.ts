import { ref, onMounted, onUnmounted } from 'vue'

export function useBreakpoint(maxWidth = 768) {
  const isNarrow = ref(false)
  let mql: MediaQueryList | undefined

  function update(e: MediaQueryListEvent | MediaQueryList) {
    isNarrow.value = e.matches
  }

  onMounted(() => {
    mql = window.matchMedia(`(max-width: ${maxWidth - 1}px)`)
    isNarrow.value = mql.matches
    mql.addEventListener('change', update)
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', update)
  })

  return { isNarrow }
}
