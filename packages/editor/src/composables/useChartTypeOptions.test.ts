import { describe, it, expect, beforeEach } from 'vitest'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useScenes } from './useScenes'
import { getChartOptions } from '@blueprint-chart/lib'

describe('useChartTypeOptions', () => {
  beforeEach(() => {
    useScenes().reset()
    useChartConfig().reset()
    useChartTypeOptions().reset()
  })

  it('returns registry defaults for a fresh type', () => {
    const { currentOptions } = useChartTypeOptions()
    const defs = getChartOptions('bar-vertical')
    const expected: Record<string, unknown> = {}
    for (const def of defs) {
      if (def.default !== undefined) {
        expected[def.key] = def.default
      }
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
      if (def.default !== undefined) {
        expected[def.key] = def.default
      }
    }
    expect(currentOptions.value).toEqual(expected)
  })

  describe('scene-aware setOption', () => {
    it('writes to scene chartTypeOptions when scene is active', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const { setOption } = useChartTypeOptions()
      setOption('colors', ['#ff0000'])

      expect(scenes.activeScene.value?.chartTypeOptions?.colors).toEqual(['#ff0000'])
    })

    it('does not modify base store when writing to scene', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const { setOption, store } = useChartTypeOptions()
      setOption('colors', ['#ff0000'])

      // Base store should not have the scene color
      expect(store['bar-vertical']?.colors).not.toEqual(['#ff0000'])
    })

    it('writes to base store when no scene is active', () => {
      const { setOption, store } = useChartTypeOptions()
      setOption('colors', ['#00ff00'])
      expect(store['bar-vertical']?.colors).toEqual(['#00ff00'])
    })

    it('accumulates multiple scene option writes', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const { setOption } = useChartTypeOptions()
      setOption('colors', ['#aaa'])
      setOption('showVerticalTicks', false)

      const opts = scenes.activeScene.value?.chartTypeOptions
      expect(opts?.colors).toEqual(['#aaa'])
      expect(opts?.showVerticalTicks).toBe(false)
    })
  })

  describe('scene-aware currentOptions', () => {
    it('merges scene chartTypeOptions over base', () => {
      const { setOption, currentOptions } = useChartTypeOptions()
      setOption('colors', ['#base'])

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, { chartTypeOptions: { colors: ['#scene'] } })
      scenes.setActive(0)

      expect(currentOptions.value.colors).toEqual(['#scene'])
    })

    it('returns base options when scene has no chartTypeOptions', () => {
      const { setOption, currentOptions } = useChartTypeOptions()
      setOption('colors', ['#base'])

      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      expect(currentOptions.value.colors).toEqual(['#base'])
    })

    it('returns base options when no scene is active', () => {
      const { setOption, currentOptions } = useChartTypeOptions()
      setOption('colors', ['#base'])
      expect(currentOptions.value.colors).toEqual(['#base'])
    })

    it('inherits chartTypeOptions from prior scene when current has none', () => {
      const { setOption, currentOptions } = useChartTypeOptions()
      setOption('colors', ['#base'])

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, { chartTypeOptions: { colors: ['#scene0'] } })
      scenes.add() // scene 1 has no chartTypeOptions

      scenes.setActive(1)
      expect(currentOptions.value.colors).toEqual(['#scene0'])
    })

    it('merges inherited options with own overrides', () => {
      const { setOption, currentOptions } = useChartTypeOptions()
      setOption('colors', ['#base'])

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, { chartTypeOptions: { colors: ['#scene0'] } })
      scenes.add()
      scenes.update(1, { chartTypeOptions: { showVerticalTicks: true } })

      scenes.setActive(1)
      expect(currentOptions.value.colors).toEqual(['#scene0'])
      expect(currentOptions.value.showVerticalTicks).toBe(true)
    })
  })

  describe('scene-aware chart type switch', () => {
    it('copies transitive options to scene when switching chart type on active scene', () => {
      const config = useChartConfig()
      const { setOption, store } = useChartTypeOptions()

      // Set base colors on bar-vertical
      config.chartType.value = 'bar-vertical'
      setOption('colors', ['#aaa', '#bbb'])

      // Activate a scene and switch its chart type
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      config.chartType.value = 'line'

      // Scene should have the chart type override
      expect(scenes.activeScene.value?.chartType).toBe('line')
      // Colors should be carried over to scene chartTypeOptions
      expect(scenes.activeScene.value?.chartTypeOptions?.colors).toEqual(['#aaa', '#bbb'])
      // Base store for line should NOT have the colors (they went to scene)
      expect(store['line']?.colors).toBeUndefined()
    })

    it('does not overwrite existing scene options on chart type switch', () => {
      const config = useChartConfig()
      const { setOption } = useChartTypeOptions()

      config.chartType.value = 'bar-vertical'
      setOption('colors', ['#old'])

      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)
      setOption('colors', ['#scene-custom'])

      config.chartType.value = 'line'

      // Scene already had colors, so they should not be overwritten
      expect(scenes.activeScene.value?.chartTypeOptions?.colors).toEqual(['#scene-custom'])
    })

    it('copies transitive options to base store when no scene is active', () => {
      const config = useChartConfig()
      const { setOption, store } = useChartTypeOptions()

      config.chartType.value = 'bar-vertical'
      setOption('colors', ['#base'])

      config.chartType.value = 'line'
      expect(store['line']?.colors).toEqual(['#base'])
    })
  })

  describe('baseOptions', () => {
    it('always returns base store values regardless of active scene', () => {
      const { setOption, baseOptions } = useChartTypeOptions()
      setOption('colors', ['#base'])

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, { chartTypeOptions: { colors: ['#scene'] } })
      scenes.setActive(0)

      expect(baseOptions.value.colors).toEqual(['#base'])
    })
  })

  describe('auto-compact scene chartTypeOptions', () => {
    it('removes option from scene when value matches base', () => {
      const { setOption } = useChartTypeOptions()
      setOption('colors', ['#base'])

      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      setOption('colors', ['#scene'])
      expect(scenes.activeScene.value?.chartTypeOptions?.colors).toEqual(['#scene'])

      // Set back to base value — should compact
      setOption('colors', ['#base'])
      expect(scenes.activeScene.value?.chartTypeOptions?.colors).toBeUndefined()
    })

    it('removes chartTypeOptions when last option is compacted', () => {
      const { setOption } = useChartTypeOptions()
      setOption('colors', ['#base'])

      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      setOption('colors', ['#scene'])
      setOption('colors', ['#base'])
      expect(scenes.activeScene.value?.chartTypeOptions).toBeUndefined()
    })

    it('keeps other options when one is compacted', () => {
      const { setOption } = useChartTypeOptions()
      setOption('colors', ['#base'])

      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      setOption('colors', ['#scene'])
      setOption('showVerticalTicks', true)

      // Compact colors back
      setOption('colors', ['#base'])
      expect(scenes.activeScene.value?.chartTypeOptions?.colors).toBeUndefined()
      expect(scenes.activeScene.value?.chartTypeOptions?.showVerticalTicks).toBe(true)
    })

    it('compacts considering inherited value from prior scene', () => {
      const { setOption } = useChartTypeOptions()
      setOption('colors', ['#base'])

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, { chartTypeOptions: { colors: ['#scene0'] } })
      scenes.add()
      scenes.setActive(1)

      setOption('colors', ['#scene1'])
      expect(scenes.scenes.value[1].chartTypeOptions?.colors).toEqual(['#scene1'])

      // Set to value inherited from scene 0 — should compact
      setOption('colors', ['#scene0'])
      expect(scenes.scenes.value[1].chartTypeOptions?.colors).toBeUndefined()
    })

    it('does not compact primitive option when value differs', () => {
      const { setOption } = useChartTypeOptions()

      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      setOption('showVerticalTicks', true)
      expect(scenes.activeScene.value?.chartTypeOptions?.showVerticalTicks).toBe(true)
    })
  })
})
