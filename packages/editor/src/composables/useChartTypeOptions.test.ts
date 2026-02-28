import { describe, it, expect, beforeEach } from 'vitest'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { getChartOptions } from '@blueprint-chart/lib'

beforeEach(() => {
  useChartConfig().reset()
  useChartTypeOptions().reset()
})

function getDefaultsFor(type: string): Record<string, unknown> {
  const defs = getChartOptions(type)
  const expected: Record<string, unknown> = {}
  for (const def of defs) {
    if (def.default !== undefined) {
      expected[def.key] = def.default
    }
  }
  return expected
}

describe('useChartTypeOptions defaults', () => {
  it('returns registry defaults for a fresh type', () => {
    const { currentOptions } = useChartTypeOptions()
    expect(currentOptions.value).toEqual(getDefaultsFor('bar-vertical'))
  })

  it('sets and gets an option', () => {
    const { setOption, currentOptions } = useChartTypeOptions()
    setOption('colors', ['#ff0000', '#00ff00'])
    expect(currentOptions.value.colors).toEqual(['#ff0000', '#00ff00'])
  })
})

describe('useChartTypeOptions switching memory', () => {
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
})

describe('useChartTypeOptions overwrite protection', () => {
  it('does not overwrite existing stored values on switch', () => {
    const config = useChartConfig()
    const { setOption, currentOptions } = useChartTypeOptions()
    config.chartType.value = 'line'
    setOption('colors', ['#111'])
    config.chartType.value = 'bar-vertical'
    setOption('colors', ['#222'])
    config.chartType.value = 'line'
    expect(currentOptions.value.colors).toEqual(['#111'])
  })

  it('does not copy unsupported options', () => {
    const config = useChartConfig()
    const { setOption, currentOptions } = useChartTypeOptions()
    config.chartType.value = 'bar-multi'
    setOption('legend', true)
    setOption('showVerticalTicks', false)
    config.chartType.value = 'donut'
    expect(currentOptions.value.legend).toBe(true)
    expect(currentOptions.value.showVerticalTicks).toBeUndefined()
  })
})

describe('useChartTypeOptions array cloning', () => {
  it('shallow-clones arrays during transitivity', () => {
    const config = useChartConfig()
    const { setOption, store } = useChartTypeOptions()
    config.chartType.value = 'bar-vertical'
    setOption('colors', ['#aaa'])
    config.chartType.value = 'line'
    store['line']!.colors!.push('#bbb')
    expect(store['bar-vertical']!.colors).toEqual(['#aaa'])
  })
})

describe('useChartTypeOptions registry keys', () => {
  it('returns correct availableOptionKeys per type', () => {
    const config = useChartConfig()
    const { availableOptionKeys } = useChartTypeOptions()
    config.chartType.value = 'donut'
    expect(availableOptionKeys.value).toEqual(getChartOptions('donut').map(d => d.key))
    config.chartType.value = 'bar-vertical'
    expect(availableOptionKeys.value).toEqual(getChartOptions('bar-vertical').map(d => d.key))
  })
})

describe('useChartTypeOptions reset', () => {
  it('clears all stored options and restores defaults', () => {
    const { setOption, currentOptions, reset } = useChartTypeOptions()
    setOption('colors', ['#fff'])
    expect(currentOptions.value.colors).toEqual(['#fff'])
    reset()
    expect(currentOptions.value).toEqual(getDefaultsFor('bar-vertical'))
  })
})
