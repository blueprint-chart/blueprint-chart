import { useMediaQuery } from '@vueuse/core'

export function useBreakpoint(maxWidth = 768) {
  const isNarrow = useMediaQuery(`(max-width: ${maxWidth - 1}px)`)
  return { isNarrow }
}
