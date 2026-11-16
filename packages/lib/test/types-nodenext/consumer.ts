import { ChartType, samples } from '@blueprint-chart/lib'
import { buildSrcdoc } from '@blueprint-chart/lib/embed'
import { initBlueprint } from '@blueprint-chart/lib/runtime'

export const lineSamples = samples.filter(s => s.chartType === 'line')
// @ts-expect-error ChartType is an enum object, so this fails only when the types are real
export const probe: symbol = ChartType
export { buildSrcdoc, initBlueprint }
