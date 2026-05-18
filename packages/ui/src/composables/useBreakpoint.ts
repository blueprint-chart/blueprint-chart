import { BOOTSTRAP_BREAKPOINTS, type BootstrapBreakpoint } from '../utils/bootstrapBreakpoints'

export function useBreakpoint(bp: number | BootstrapBreakpoint = 'md') {
  const maxWidth = typeof bp === 'number' ? bp : BOOTSTRAP_BREAKPOINTS[bp]
  const isNarrow = useMediaQuery(`(max-width: ${maxWidth - 1}px)`)
  return { isNarrow }
}
