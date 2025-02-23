export function computeLinearDomain(
  values: number[],
  range?: { min?: number, max?: number },
): [number, number] {
  const dataMin = Math.min(0, ...values)
  const dataMax = Math.max(0, ...values)
  return [
    range?.min ?? dataMin,
    range?.max ?? dataMax,
  ]
}
