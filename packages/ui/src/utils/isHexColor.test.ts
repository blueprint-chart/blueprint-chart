import { isHexColor } from './isHexColor'

describe('isHexColor', () => {
  it.each(['#0055a4', '#0055A4', '#ABCDEF'])('accepts %s', (value) => {
    expect(isHexColor(value)).toBe(true)
  })

  it.each(['#fff', '0055a4', ' #0055a4', '#0055a4ff', '#gggggg', ''])('rejects %j', (value) => {
    expect(isHexColor(value)).toBe(false)
  })
})
