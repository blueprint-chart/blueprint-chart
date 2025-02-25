import { describe, it, expect, beforeEach } from 'vitest'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { getChartOptions } from '@blueprint-chart/lib'

describe('useChartTypeOptions', () => {
  beforeEach(() => {
    useChartConfig().reset()
    useChartTypeOptions().reset()
  })

  it('returns registry defaults for a fresh type', () => {
    const { currentOptions } = useChartTypeOptions()
    const defs = getChartOptions('bar-vertical')
    const expected: Record<string, unknown> = {}
    for (const def of defs) {
      if (def.default !== undefined) expected[def.key] = def.default
    }
    expect(currentOptions.value).toEqual(expected)
  })

  it('sets and gets an option', () => {
    const { setOption, currentOptions } = useChartTypeOptions()
    setOption('colors', ['#ff0000', '#00ff00'])
    expect(currentOptions.value.colors).toEqual(['#ff0000', '#00ff00'])
  })

  it('preserves per-type memory across switches', () => {
    const config = useChartConfig()
    const { setOption, currentOptions } = useChartTypeOptions()

    config.chartType.value = 'bar-vertical'
    setOption('showVerticalTicks', false)

    config.chartType.value = 'donut'
    setOption('legend', false)

    config.chartType.value = 'bar-vertical'
    expect(currentOptions.value.showVerticalTicks).toBe(false)

    config.chartType.value = 'donut'
    expect(currentOptions.value.legend).toBe(false)
  })

  it('copies transitive options to new type', () => {
    const config = useChartConfig()
    const { setOption, currentOptions } = useChartTypeOptions()

    config.chartType.value = 'bar-vertical'
    setOption('colors', ['#aaa', '#bbb'])

    config.chartType.value = 'line'
    expect(currentOptions.value.colors).toEqual(['#aaa', '#bbb'])
  })

  it('does not overwrite existing stored values on switch', () => {
    const config = useChartConfig()
    const { setOption, currentOptions } = useChartTypeOptions()

    config.chartType.value = 'line'
    setOption('colors', ['#111'])

    config.chartType.value = 'bar-vertical'
    setOption('colors', ['#222'])

    config.chartType.value = 'line'
    // line already had colors stored, so bar-vertical's colors should not overwrite
    expect(currentOptions.value.colors).toEqual(['#111'])
  })

  it('does not copy unsupported options', () => {
    const config = useChartConfig()
    const { setOption, currentOptions } = useChartTypeOptions()

    config.chartType.value = 'bar-multi'
    setOption('legend', true)
    setOption('showVerticalTicks', false)

    config.chartType.value = 'donut'
    // legend is supported on donut
    expect(currentOptions.value.legend).toBe(true)
    // showVerticalTicks is NOT supported on donut
    expect(currentOptions.value.showVerticalTicks).toBeUndefined()
  })

  it('shallow-clones arrays during transitivity', () => {
    const config = useChartConfig()
    const { setOption, store } = useChartTypeOptions()

    config.chartType.value = 'bar-vertical'
    setOption('colors', ['#aaa'])

    config.chartType.value = 'line'
    // Mutating line's colors should not affect bar-vertical's
    store['line']!.colors!.push('#bbb')
    expect(store['bar-vertical']!.colors).toEqual(['#aaa'])
  })

  it('returns correct availableOptionKeys per type from registry', () => {
    const config = useChartConfig()
    const { availableOptionKeys } = useChartTypeOptions()

    config.chartType.value = 'donut'
    const donutKeys = getChartOptions('donut').map(d => d.key)
    expect(availableOptionKeys.value).toEqual(donutKeys)

    config.chartType.value = 'bar-vertical'
    const barKeys = getChartOptions('bar-vertical').map(d => d.key)
    expect(availableOptionKeys.value).toEqual(barKeys)
  })

  it('reset clears all stored options and restores defaults', () => {
    const { setOption, currentOptions, reset } = useChartTypeOptions()
    setOption('colors', ['#fff'])
    expect(currentOptions.value.colors).toEqual(['#fff'])

    reset()
    // After reset, accessing currentOptions re-seeds registry defaults
    const defs = getChartOptions('bar-vertical')
    const expected: Record<string, unknown> = {}
    for (const def of defs) {
      if (def.default !== undefined) expected[def.key] = def.default
    }
    expect(currentOptions.value).toEqual(expected)
  })
})
