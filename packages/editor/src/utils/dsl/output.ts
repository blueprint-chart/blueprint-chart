export function serializePosition(v: number | string): string {
  if (typeof v === 'number') {
    return String(v)
  }
  const str = String(v)
  if (str.endsWith('%')) {
    return String(parseFloat(str))
  }
  // "150px" → quoted string
  return `"${str}"`
}

export function serializeMaxWidth(v: number | string): string {
  if (typeof v === 'number') {
    return String(v)
  }
  const str = String(v)
  if (str.endsWith('%')) {
    return `"${
      str}"`
  }
  // "150px" → bare number
  return String(parseFloat(str))
}
