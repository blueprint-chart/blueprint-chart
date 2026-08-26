/**
 * Decode a base64 BPC payload taken from a URL.
 *
 * Accepts both alphabets (RFC 4648 §4 and §5: `-`/`_` as well as `+`/`/`) with
 * optional padding, and restores a `+` that arrived as a space, since
 * vue-router's query parser rewrites `+` to a space and no base64 alphabet
 * contains one. Returns the decoded UTF-8 string, or `null` if malformed.
 */
export function decodeUrlSafeBase64(raw: string): string | null {
  if (!raw) {
    return null
  }
  try {
    const padded = raw.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/')
    const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
    // atob returns a binary string; decode it as UTF-8 so BPC sources with
    // non-ASCII characters (en dashes, currency symbols, etc.) survive intact.
    const binary = atob(padded + padding)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new TextDecoder().decode(bytes)
  }
  catch {
    return null
  }
}
