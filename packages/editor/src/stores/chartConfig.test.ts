import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useChartConfig } from './chartConfig'
import { useScenes } from './scenes'

describe('useChartConfig', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
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
    it('has playerType default of buttons', () => {
      const config = useChartConfig()
      expect(config.layout.value.playerType).toBe('buttons')
    })

    it('has playerPosition default of left', () => {
      const config = useChartConfig()
      expect(config.layout.value.playerPosition).toBe('left')
    })

    it('preserves playerType through hydrate', () => {
      const config = useChartConfig()
      config.layout.value = { ...config.layout.value, playerType: 'dot-stepper' }
      expect(config.layout.value.playerType).toBe('dot-stepper')

      // Reset restores default
      config.reset()
      expect(config.layout.value.playerType).toBe('buttons')
    })
  })

  describe('annotation scene-awareness', () => {
    it('annotations reads from base when no scene is active', () => {
      const config = useChartConfig()
      config._base.annotations.value = [
        { kind: 'point', text: 'Base note', target: 'A' },
      ]
      expect(config.annotations.value).toEqual([
        { kind: 'point', text: 'Base note', target: 'A' },
      ])
    })

    it('annotations reads from scene when scene with annotations is active', () => {
      const config = useChartConfig()
      const scenes = useScenes()

      config._base.annotations.value = [
        { kind: 'point', text: 'Base note', target: 'A' },
      ]

      scenes.add()
      scenes.update(0, {
        annotations: [{ kind: 'free', text: 'Scene note', x: 10, y: 20 }],
      })
      scenes.setActive(0)

      expect(config.annotations.value).toEqual([
        { kind: 'free', text: 'Scene note', x: 10, y: 20 },
      ])
    })

    it('annotations falls back to base when scene has no annotations', () => {
      const config = useChartConfig()
      const scenes = useScenes()

      config._base.annotations.value = [
        { kind: 'point', text: 'Base note', target: 'A' },
      ]

      scenes.add()
      scenes.setActive(0)

      expect(config.annotations.value).toEqual([
        { kind: 'point', text: 'Base note', target: 'A' },
      ])
    })

    it('writing annotations targets scene when scene is active', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const config = useChartConfig()
      config.annotations.value = [
        { kind: 'free', text: 'Written to scene', x: 5, y: 5 },
      ]

      expect(scenes.activeScene.value?.annotations).toEqual([
        { kind: 'free', text: 'Written to scene', x: 5, y: 5 },
      ])
      expect(config._base.annotations.value).toEqual([])
    })

    it('writing annotations targets base when no scene is active', () => {
      const config = useChartConfig()
      config.annotations.value = [
        { kind: 'point', text: 'To base', target: 'B' },
      ]

      expect(config._base.annotations.value).toEqual([
        { kind: 'point', text: 'To base', target: 'B' },
      ])
    })

    it('scene annotation ids are preserved through read/write cycle', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.update(0, {
        annotations: [
          { kind: 'point', id: 'ann-1', text: 'First', target: 'X' },
          { kind: 'free', id: 'ann-2', text: 'Second', x: 0, y: 0 },
        ],
      })
      scenes.setActive(0)

      const config = useChartConfig()
      const current = config.annotations.value

      // Modify text but keep ids
      config.annotations.value = current.map(a =>
        a.kind === 'point'
          ? { ...a, text: 'Updated First' }
          : { ...a, text: 'Updated Second' },
      )

      expect(scenes.activeScene.value?.annotations).toEqual([
        { kind: 'point', id: 'ann-1', text: 'Updated First', target: 'X' },
        { kind: 'free', id: 'ann-2', text: 'Updated Second', x: 0, y: 0 },
      ])
    })

    it('base annotations are not affected when writing to scene annotations', () => {
      const config = useChartConfig()
      const scenes = useScenes()

      config._base.annotations.value = [
        { kind: 'point', text: 'Base stays', target: 'A' },
      ]

      scenes.add()
      scenes.setActive(0)

      config.annotations.value = [
        { kind: 'free', text: 'Scene only', x: 1, y: 2 },
      ]

      // Deactivate scene
      scenes.setActive(-1)

      expect(config.annotations.value).toEqual([
        { kind: 'point', text: 'Base stays', target: 'A' },
      ])
      expect(config._base.annotations.value).toEqual([
        { kind: 'point', text: 'Base stays', target: 'A' },
      ])
    })
  })

  describe('scene cascading in editor refs', () => {
    it('highlights from earlier scene are visible in later scene without override', () => {
      const config = useChartConfig()
      const scenes = useScenes()

      scenes.add()
      scenes.update(0, {
        highlights: [{ target: 'India', color: '#00d084', label: '' }],
      })
      scenes.add() // scene 1 has no highlights

      scenes.setActive(1)
      expect(config.highlights.value).toEqual([
        { target: 'India', color: '#00d084', label: '' },
      ])
    })

    it('annotations from earlier scene cascade to later scene', () => {
      const config = useChartConfig()
      const scenes = useScenes()

      scenes.add()
      scenes.update(0, {
        annotations: [{ kind: 'point', id: 'p1', text: 'From scene 0', target: 'India' }],
      })
      scenes.add() // scene 1 has no annotations

      scenes.setActive(1)
      expect(config.annotations.value).toEqual([
        { kind: 'point', id: 'p1', text: 'From scene 0', target: 'India' },
      ])
    })

    it('chartType from earlier scene cascades to later scene', () => {
      const config = useChartConfig()
      const scenes = useScenes()

      config._base.chartType.value = 'bar-vertical'
      scenes.add()
      scenes.update(0, { chartType: 'line' })
      scenes.add()

      scenes.setActive(1)
      expect(config.chartType.value).toBe('line')
    })

    it('property from earlier scene cascades to later scene', () => {
      const config = useChartConfig()
      const scenes = useScenes()

      config._base.title.value = 'Base Title'
      scenes.add()
      scenes.update(0, { properties: { title: 'Scene 0 Title' } })
      scenes.add()

      scenes.setActive(1)
      expect(config.title.value).toBe('Scene 0 Title')
    })

    it('own override takes precedence over inherited value', () => {
      const config = useChartConfig()
      const scenes = useScenes()

      scenes.add()
      scenes.update(0, {
        highlights: [{ target: 'India', color: '#00d084', label: '' }],
      })
      scenes.add()
      scenes.update(1, {
        highlights: [{ target: 'China', color: '#ff0000', label: '' }],
      })

      scenes.setActive(1)
      expect(config.highlights.value).toEqual([
        { target: 'China', color: '#ff0000', label: '' },
      ])
    })

    it('falls back to base when no prior scene overrides', () => {
      const config = useChartConfig()
      const scenes = useScenes()

      config._base.chartType.value = 'bar-vertical'
      scenes.add()
      scenes.add()

      scenes.setActive(1)
      expect(config.chartType.value).toBe('bar-vertical')
    })

    it('data from earlier scene cascades to later scene', () => {
      const config = useChartConfig()
      const scenes = useScenes()

      config._base.data.value = 'Label,Value\nA,10'
      scenes.add()
      scenes.update(0, { data: 'Label,Value\nX,99\nY,88' })
      scenes.add() // scene 1 has no data override

      scenes.setActive(1)
      expect(config.data.value).toBe('Label,Value\nX,99\nY,88')
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

  describe('auto-compact scene overrides', () => {
    it('removes direct override when value matches base', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const config = useChartConfig()
      config._base.chartType.value = 'bar-vertical'
      config.chartType.value = 'line'
      expect(scenes.activeScene.value?.chartType).toBe('line')

      // Set back to base value — override should be removed
      config.chartType.value = 'bar-vertical'
      expect(scenes.activeScene.value?.chartType).toBeUndefined()
    })

    it('removes property override when value matches base', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const config = useChartConfig()
      config._base.title.value = 'Base Title'
      config.title.value = 'Scene Title'
      expect(scenes.activeScene.value?.properties?.title).toBe('Scene Title')

      // Set back to base value — property should be removed
      config.title.value = 'Base Title'
      expect(scenes.activeScene.value?.properties?.title).toBeUndefined()
    })

    it('removes properties object when last property is compacted', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const config = useChartConfig()
      config._base.title.value = 'Base Title'
      config.title.value = 'Scene Title'

      // Compact back — properties should be cleaned up
      config.title.value = 'Base Title'
      expect(scenes.activeScene.value?.properties).toBeUndefined()
    })

    it('keeps other properties when one is compacted', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const config = useChartConfig()
      config._base.title.value = 'Base Title'
      config._base.description.value = 'Base Desc'
      config.title.value = 'Scene Title'
      config.description.value = 'Scene Desc'

      // Compact title back — description should remain
      config.title.value = 'Base Title'
      expect(scenes.activeScene.value?.properties?.title).toBeUndefined()
      expect(scenes.activeScene.value?.properties?.description).toBe('Scene Desc')
    })

    it('removes highlights override when value matches base (empty array)', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const config = useChartConfig()
      // Base has empty highlights
      config.highlights.value = [{ target: 'A', color: '#f00', label: '' }]
      expect(scenes.activeScene.value?.highlights).toBeDefined()

      // Set back to empty — should compact
      config.highlights.value = []
      expect(scenes.activeScene.value?.highlights).toBeUndefined()
    })

    it('does not compact when value differs from base', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      const config = useChartConfig()
      config._base.chartType.value = 'bar-vertical'
      config.chartType.value = 'line'
      expect(scenes.activeScene.value?.chartType).toBe('line')
    })

    it('compacts direct ref considering inherited value from prior scene', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.update(0, { chartType: 'line' })
      scenes.add()
      scenes.setActive(1)

      const config = useChartConfig()
      config._base.chartType.value = 'bar-vertical'
      // Scene 1 overrides to 'donut'
      config.chartType.value = 'donut'
      expect(scenes.scenes.value[1].chartType).toBe('donut')

      // Set to the value inherited from scene 0 ('line') — should compact
      config.chartType.value = 'line'
      expect(scenes.scenes.value[1].chartType).toBeUndefined()
    })

    it('compacts property ref considering inherited value from prior scene', () => {
      const scenes = useScenes()
      scenes.add()
      scenes.update(0, { properties: { title: 'Scene 0 Title' } })
      scenes.add()
      scenes.setActive(1)

      const config = useChartConfig()
      config._base.title.value = 'Base Title'
      config.title.value = 'Scene 1 Title'
      expect(scenes.scenes.value[1].properties?.title).toBe('Scene 1 Title')

      // Set to value inherited from scene 0 — should compact
      config.title.value = 'Scene 0 Title'
      expect(scenes.scenes.value[1].properties?.title).toBeUndefined()
    })
  })
})
