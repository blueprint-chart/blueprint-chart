import { expect } from 'vitest'
import { getChartOptions } from '../registry'
import type { ChartType } from '../../enums'

/**
 * Asserts that a chart type's option default matches the expected value.
 * Failure messages cite the wiki rule for traceability.
 */
export function expectDefault(
  chart: ChartType,
  optionKey: string,
  expected: unknown,
  rule: string,
): void {
  const opt = getChartOptions(chart).find(o => o.key === optionKey)
  expect(opt, `option "${optionKey}" not registered for ${chart}`).toBeDefined()
  expect(opt!.default, `${chart}.${optionKey} per ${rule}`).toEqual(expected)
}
