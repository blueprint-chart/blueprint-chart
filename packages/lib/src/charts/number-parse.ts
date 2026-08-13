/**
 * Remove the whitespace that groups digits in a written-out number, so that
 * "1 559 275" reads as 1559275. Only whitespace sitting between two digits is
 * removed: no locale uses a space as a decimal marker, which makes this
 * unambiguous, and it leaves labels like "North 1" untouched.
 *
 * The `\s` class already covers the separators locales and spreadsheets emit
 * (plain space, no-break space U+00A0, narrow no-break space U+202F, thin space
 * U+2009, figure space U+2007), so none of them need special casing.
 */
export function stripDigitGroupSpaces(value: string): string {
  return value.replace(/(\d)\s+(?=\d)/g, '$1')
}

/**
 * Strip everything a data cell may carry around its digits: the quotes that a
 * non-bare value keeps when it survives `dataEntriesToString`, the spaces that
 * group its digits, and a trailing percentage sign.
 */
function normalizeCell(raw: string): string {
  const unquoted = raw.replace(/^"(.*)"$/, '$1')
  return stripDigitGroupSpaces(unquoted).replace(/%$/, '').trim()
}

/**
 * Parse a single numeric cell, returning `undefined` for empty/missing/non-finite
 * inputs so consumers can distinguish "no data" from a literal zero.
 * Callers continue to coalesce via `?? 0` when a numeric fallback is needed.
 */
export function parseNumericCell(raw: string | undefined): number | undefined {
  const cleaned = normalizeCell(raw?.trim() ?? '')
  if (!cleaned) {
    return undefined
  }
  // `Number` rather than `parseFloat`: once the quotes are gone, parseFloat's
  // leading-prefix tolerance would read "1,234" as 1, turning an unsupported
  // separator into a plausible wrong value instead of a visible gap.
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : undefined
}
