export interface DocEdit {
  from: number
  to: number
  insert: string
}

/**
 * Smallest single-range edit that turns `oldText` into `newText`, computed by
 * collapsing the common prefix and (non-overlapping) common suffix. Returns
 * `null` when the strings are identical.
 */
export function diffEdit(oldText: string, newText: string): DocEdit | null {
  if (oldText === newText) {
    return null
  }

  let prefix = 0
  const maxPrefix = Math.min(oldText.length, newText.length)
  while (prefix < maxPrefix && oldText[prefix] === newText[prefix]) {
    prefix++
  }

  let suffix = 0
  const maxSuffix = Math.min(oldText.length - prefix, newText.length - prefix)
  while (
    suffix < maxSuffix
    && oldText[oldText.length - 1 - suffix] === newText[newText.length - 1 - suffix]
  ) {
    suffix++
  }

  return {
    from: prefix,
    to: oldText.length - suffix,
    insert: newText.slice(prefix, newText.length - suffix),
  }
}
