export interface Hsv {
  h: number
  s: number
  v: number
}

type Rgb = [number, number, number]

function hexToRgb(hex: string): Rgb {
  const channels = hex.slice(1).match(/../g) ?? []
  return channels.map(channel => parseInt(channel, 16) / 255) as Rgb
}

function hueFromRgb([r, g, b]: Rgb, max: number, delta: number): number {
  if (delta === 0) {
    return 0
  }
  const sector = max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
  return (sector * 60 + 360) % 360
}

export function hexToHsv(hex: string): Hsv {
  const rgb = hexToRgb(hex)
  const max = Math.max(...rgb)
  const delta = max - Math.min(...rgb)
  return { h: hueFromRgb(rgb, max, delta), s: max === 0 ? 0 : delta / max, v: max }
}

function channelFromHsv({ h, s, v }: Hsv, offset: number): number {
  const k = (offset + h / 60) % 6
  return v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
}

function toHexByte(channel: number): string {
  return Math.round(channel * 255).toString(16).padStart(2, '0')
}

export function hsvToHex(hsv: Hsv): string {
  return `#${[5, 3, 1].map(offset => toHexByte(channelFromHsv(hsv, offset))).join('')}`
}
