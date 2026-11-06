import { toHexColor } from './toHexColor'

describe('toHexColor', () => {
  it.each([
    ['red', '#ff0000'],
    ['#f00', '#ff0000'],
    ['#0055A4', '#0055a4'],
    ['rgb(0, 85, 164)', '#0055a4'],
  ])('converts %s to %s', (value, expected) => {
    expect(toHexColor(value)).toBe(expected)
  })

  it.each(['not-a-color', ''])('returns null for %j', (value) => {
    expect(toHexColor(value)).toBeNull()
  })
})
