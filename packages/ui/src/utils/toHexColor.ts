import { color } from 'd3-color'

export function toHexColor(value: string): string | null {
  return color(value)?.formatHex() ?? null
}
