/**
 * URL-safe base64 encode a UTF-8 string, mirroring `urlSafeB64Encode` in the
 * docs package: standard base64, then `+` -> `-`, `/` -> `_`, strip `=` padding.
 */
export function urlSafeB64Encode(input: string): string {
  const b64 = Buffer.from(input, 'utf-8').toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
