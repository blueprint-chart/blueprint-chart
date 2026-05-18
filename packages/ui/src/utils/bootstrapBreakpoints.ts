// packages/ui/src/utils/bootstrapBreakpoints.ts
/**
 * Mirrors Bootstrap 5's $grid-breakpoints map.
 * Source of truth: node_modules/bootstrap/scss/_variables.scss
 * Keep these values in sync with the Bootstrap version pinned in pnpm-lock.yaml.
 */
export const BOOTSTRAP_BREAKPOINTS = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const

export type BootstrapBreakpoint = keyof typeof BOOTSTRAP_BREAKPOINTS
