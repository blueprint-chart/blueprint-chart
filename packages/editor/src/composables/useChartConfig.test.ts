import { describe, it, expect, beforeEach } from 'vitest'
import { useChartConfig } from './useChartConfig'
import { useScenes } from './useScenes'

describe('useChartConfig', () => {
  beforeEach(() => {
    useScenes().reset()
    useChartConfig().reset()
  })

  describe('scene-aware direct refs', () => {
    it('reads base value when no scene is active', () => {
      const config = useChartConfig()
      config._base.chartType.value = 'line'
      expect(config.chartType.value).toBe('line')
    })

    it('reads scene value when scene overrides the key', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.update(0, { chartType: 'donut' })
      scenes.setActive(0)

      const config = useChartConfig()
      config._base.chartType.value = 'bar-vertical'
      expect(config.chartType.value).toBe('donut')
    })

    it('falls back to base when scene does not override the key', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const config = useChartConfig()
      config._base.chartType.value = 'bar-vertical'
      // Scene has no chartType override
      expect(config.chartType.value).toBe('bar-vertical')
    })

    it('writes to scene override when scene is active', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const config = useChartConfig()
      config.highlights.value = [{ target: 'A', color: '#f00', label: '' }]

      expect(scenes.activeScene.value?.highlights).toEqual([
        { target: 'A', color: '#f00', label: '' },
      ])
      // Base should remain empty
      expect(config._base.highlights.value).toEqual([])
    })

    it('writes to base when no scene is active', () => {
      const config = useChartConfig()
      config.highlights.value = [{ target: 'B', color: '#0f0', label: '' }]

      expect(config._base.highlights.value).toEqual([
        { target: 'B', color: '#0f0', label: '' },
      ])
    })

    it('routes data writes to active scene', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const config = useChartConfig()
      config.data.value = 'Label,Value\nX,1'

      expect(scenes.activeScene.value?.data).toBe('Label,Value\nX,1')
      expect(config._base.data.value).toBe('')
    })
  })

  describe('scene-aware property refs', () => {
    it('reads base value when no scene is active', () => {
      const config = useChartConfig()
      config._base.title.value = 'Base Title'
      expect(config.title.value).toBe('Base Title')
    })

    it('reads scene property when scene has the property', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.update(0, { properties: { title: 'Scene Title' } })
      scenes.setActive(0)

      const config = useChartConfig()
      config._base.title.value = 'Base Title'
      expect(config.title.value).toBe('Scene Title')
    })

    it('falls back to base when scene has no properties', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const config = useChartConfig()
      config._base.title.value = 'Base Title'
      expect(config.title.value).toBe('Base Title')
    })

    it('writes to scene properties when scene is active', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const config = useChartConfig()
      config.title.value = 'Scene Title'

      expect(scenes.activeScene.value?.properties?.title).toBe('Scene Title')
      expect(config._base.title.value).toBe('')
    })

    it('preserves existing scene properties when writing a new one', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.update(0, { properties: { byline: 'Author' } })
      scenes.setActive(0)

      const config = useChartConfig()
      config.title.value = 'New Title'

      expect(scenes.activeScene.value?.properties).toEqual({
        byline: 'Author',
        title: 'New Title',
      })
    })

    it('writes to base when no scene is active', () => {
      const config = useChartConfig()
      config.source.value = 'Census'
      expect(config._base.source.value).toBe('Census')
    })
  })

  describe('layout is not scene-aware', () => {
    it('always reads and writes base layout', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const config = useChartConfig()
      // layout should be the raw base ref, not a scene-aware computed
      config.layout.value = { ...config.layout.value, padding: 42 }
      expect(config._base.layout.value.padding).toBe(42)
    })
  })

  describe('layout player defaults', () => {
    it('has playerType default of progress-bar', () => {
      const config = useChartConfig()
      expect(config.layout.value.playerType).toBe('progress-bar')
    })

    it('has playerPosition default of center', () => {
      const config = useChartConfig()
      expect(config.layout.value.playerPosition).toBe('center')
    })

    it('preserves playerType through hydrate', () => {
      const config = useChartConfig()
      config.layout.value = { ...config.layout.value, playerType: 'dot-stepper' }
      expect(config.layout.value.playerType).toBe('dot-stepper')

      // Reset restores default
      config.reset()
      expect(config.layout.value.playerType).toBe('progress-bar')
    })
  })

  describe('_base refs bypass scene awareness', () => {
    it('always reads base values regardless of active scene', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.update(0, { chartType: 'donut', properties: { title: 'Override' } })
      scenes.setActive(0)

      const config = useChartConfig()
      config._base.chartType.value = 'bar-vertical'
      config._base.title.value = 'Base'

      expect(config._base.chartType.value).toBe('bar-vertical')
      expect(config._base.title.value).toBe('Base')
    })

    it('always writes to base state regardless of active scene', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const config = useChartConfig()
      config._base.title.value = 'Direct Base Write'

      expect(config._base.title.value).toBe('Direct Base Write')
    })
  })
})
