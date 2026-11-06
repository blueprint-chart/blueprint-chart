import { isHexColor } from './isHexColor'

const SHORT_HEX_COLOR = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i

export function expandHexColor(value: string): string | null {
  if (isHexColor(value)) {
    return value
  }
  const digits = SHORT_HEX_COLOR.exec(value)?.slice(1)
  return digits ? `#${digits.map(digit => digit + digit).join('')}` : null
}
