import { decodeUrlSafeBase64 } from './base64'

const BPC = 'chart bar-vertical {\n  title = "CO₂"\n}\n'
const STANDARD = Buffer.from(BPC, 'utf-8').toString('base64')

describe('decodeUrlSafeBase64', () => {
  it('decodes standard base64 that contains a plus', () => {
    expect(STANDARD).toContain('+')
    expect(decodeUrlSafeBase64(STANDARD)).toBe(BPC)
  })

  // vue-router's query parser rewrites `+` to a space, so an address bar that
  // never percent-encoded the payload hands us spaces.
  it('decodes a payload whose plus arrived as a space', () => {
    expect(decodeUrlSafeBase64(STANDARD.replace(/\+/g, ' '))).toBe(BPC)
  })

  it('decodes the URL-safe alphabet with padding stripped', () => {
    const urlSafe = STANDARD.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    expect(decodeUrlSafeBase64(urlSafe)).toBe(BPC)
  })

  it('returns null for an empty or malformed payload', () => {
    expect(decodeUrlSafeBase64('')).toBeNull()
    expect(decodeUrlSafeBase64('not!base64@@')).toBeNull()
  })
})
