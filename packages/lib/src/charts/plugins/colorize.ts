import type { ColorizeConfig } from '../types'

/** Map of colorize target → custom colour. Empty when no colorizes are set. */
export function buildColorOverrides(colorizes?: ColorizeConfig[]): Map<string, string> {
  return new Map((colorizes ?? []).map(c => [c.target, c.color]))
}
