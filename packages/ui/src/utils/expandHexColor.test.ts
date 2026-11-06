import { expandHexColor } from './expandHexColor'

describe('expandHexColor', () => {
  it.each([
    ['#f00', '#ff0000'],
    ['#ABC', '#AABBCC'],
    ['#0055a4', '#0055a4'],
  ])('expands %s to %s', (value, expected) => {
    expect(expandHexColor(value)).toBe(expected)
  })

  it.each(['f00', '#ff', '#ff00', '#ggg', ''])('returns null for %j', (value) => {
    expect(expandHexColor(value)).toBeNull()
  })
})
