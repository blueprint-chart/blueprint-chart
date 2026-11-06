import { hexToHsv, hsvToHex } from './hsv'

describe('hexToHsv', () => {
  it.each([
    ['#ff0000', { h: 0, s: 1, v: 1 }],
    ['#00ff00', { h: 120, s: 1, v: 1 }],
    ['#0000ff', { h: 240, s: 1, v: 1 }],
    ['#ffffff', { h: 0, s: 0, v: 1 }],
    ['#000000', { h: 0, s: 0, v: 0 }],
    ['#808080', { h: 0, s: 0, v: 128 / 255 }],
  ])('converts %s', (hex, expected) => {
    const { h, s, v } = hexToHsv(hex)
    expect(h).toBeCloseTo(expected.h)
    expect(s).toBeCloseTo(expected.s)
    expect(v).toBeCloseTo(expected.v)
  })

  it('accepts uppercase hex', () => {
    expect(hexToHsv('#FF0000')).toEqual({ h: 0, s: 1, v: 1 })
  })
})

describe('hsvToHex', () => {
  it.each([
    [{ h: 0, s: 1, v: 1 }, '#ff0000'],
    [{ h: 120, s: 1, v: 1 }, '#00ff00'],
    [{ h: 240, s: 1, v: 1 }, '#0000ff'],
    [{ h: 360, s: 1, v: 1 }, '#ff0000'],
    [{ h: 0, s: 0, v: 1 }, '#ffffff'],
    [{ h: 200, s: 0, v: 0 }, '#000000'],
  ])('converts %j', (hsv, expected) => {
    expect(hsvToHex(hsv)).toBe(expected)
  })

  it.each(['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#123456'])('round-trips %s', (hex) => {
    expect(hsvToHex(hexToHsv(hex))).toBe(hex)
  })
})
