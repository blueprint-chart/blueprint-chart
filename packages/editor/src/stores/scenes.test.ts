import type { AnnotationConfig } from '@blueprint-chart/lib'
import { useScenes } from './scenes'

describe('useScenes', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with empty state', () => {
    const { scenes, activeIndex, playing } = useScenes()
    expect(scenes.value).toEqual([])
    expect(activeIndex.value).toBe(-1)
    expect(playing.value).toBe(false)
  })

  it('adds a scene with generated id', () => {
    const { scenes, add } = useScenes()
    const id = add()
    expect(id).toHaveLength(8)
    expect(scenes.value).toHaveLength(1)
    expect(scenes.value[0].id).toBe(id)
    expect(scenes.value[0].name).toBeNull()
  })

  it('adds multiple scenes', () => {
    const { scenes, add } = useScenes()
    add()
    add()
    add()
    expect(scenes.value).toHaveLength(3)
  })

  it('removes a scene by index', () => {
    const { scenes, add, remove } = useScenes()
    add()
    const id2 = add()
    add()
    remove(0)
    expect(scenes.value).toHaveLength(2)
    expect(scenes.value[0].id).toBe(id2)
  })

  it('resets activeIndex when removing last scene', () => {
    const { add, remove, setActive, activeIndex } = useScenes()
    add()
    setActive(0)
    remove(0)
    expect(activeIndex.value).toBe(-1)
  })

  it('clamps activeIndex when removing at end', () => {
    const { add, remove, setActive, activeIndex } = useScenes()
    add()
    add()
    setActive(1)
    remove(1)
    expect(activeIndex.value).toBe(0)
  })

  it('updates a scene with partial data', () => {
    const { scenes, add, update } = useScenes()
    add()
    update(0, { name: 'Scene 1', chartType: 'line' })
    expect(scenes.value[0].name).toBe('Scene 1')
    expect(scenes.value[0].chartType).toBe('line')
  })

  it('ignores update for out-of-range index', () => {
    const { scenes, add, update } = useScenes()
    add()
    update(5, { name: 'nope' })
    expect(scenes.value[0].name).toBeNull()
  })

  it('sets active index', () => {
    const { add, setActive, activeIndex, activeScene } = useScenes()
    add()
    add()
    expect(activeScene.value).toBeNull()
    setActive(1)
    expect(activeIndex.value).toBe(1)
    expect(activeScene.value).not.toBeNull()
  })

  it('setActive(-1) returns to base chart', () => {
    const { add, setActive, activeIndex, activeScene } = useScenes()
    add()
    setActive(0)
    setActive(-1)
    expect(activeIndex.value).toBe(-1)
    expect(activeScene.value).toBeNull()
  })

  it('ignores setActive for invalid index', () => {
    const { add, setActive, activeIndex } = useScenes()
    add()
    setActive(0)
    setActive(5)
    expect(activeIndex.value).toBe(0)
  })

  it('setActive is a no-op for same index', () => {
    const { add, setActive, activeIndex } = useScenes()
    add()
    setActive(0)
    setActive(0)
    expect(activeIndex.value).toBe(0)
  })

  it('reorders scenes', () => {
    const { scenes, add, reorder } = useScenes()
    const id1 = add()
    add()
    const id3 = add()
    reorder(0, 2)
    expect(scenes.value[2].id).toBe(id1)
    expect(scenes.value[0].id).not.toBe(id3)
  })

  it('reorder follows active item', () => {
    const { add, setActive, activeIndex, reorder } = useScenes()
    add()
    add()
    add()
    setActive(0)
    reorder(0, 2)
    expect(activeIndex.value).toBe(2)
  })

  it('ignores reorder with out-of-range indices', () => {
    const { scenes, add, reorder } = useScenes()
    const id1 = add()
    reorder(-1, 0)
    reorder(0, 5)
    expect(scenes.value[0].id).toBe(id1)
  })

  describe('playback', () => {
    it('starts playback from base', () => {
      const { add, startPlayback, activeIndex, playing } = useScenes()
      add()
      add()
      add()
      startPlayback()
      expect(playing.value).toBe(true)
      expect(activeIndex.value).toBe(-1)
      vi.advanceTimersByTime(3000)
      expect(activeIndex.value).toBe(0)
    })

    it('stops at last scene', () => {
      const { add, startPlayback, activeIndex, playing } = useScenes()
      add()
      add()
      startPlayback()
      vi.advanceTimersByTime(3000)
      expect(activeIndex.value).toBe(0)
      vi.advanceTimersByTime(3000)
      expect(activeIndex.value).toBe(1)
      vi.advanceTimersByTime(3000)
      expect(playing.value).toBe(false)
    })

    it('stopPlayback clears interval', () => {
      const { add, startPlayback, stopPlayback, playing } = useScenes()
      add()
      add()
      startPlayback()
      stopPlayback()
      expect(playing.value).toBe(false)
    })

    it('double start is a no-op', () => {
      const { add, startPlayback, activeIndex } = useScenes()
      add()
      add()
      startPlayback()
      startPlayback()
      vi.advanceTimersByTime(3000)
      expect(activeIndex.value).toBe(0)
    })
  })

  it('snapshot returns a copy of state', () => {
    const { add, update, setActive, snapshot } = useScenes()
    add()
    update(0, { name: 'Test' })
    setActive(0)
    const snap = snapshot()
    expect(snap.scenes).toHaveLength(1)
    expect(snap.scenes[0].name).toBe('Test')
    expect(snap.activeIndex).toBe(0)
  })

  it('hydrate restores state', () => {
    const { scenes, activeIndex, hydrate } = useScenes()
    hydrate({
      scenes: [
        { id: 'abc', name: 'S1' },
        { id: 'def', name: 'S2' },
      ],
      activeIndex: 1,
    })
    expect(scenes.value).toHaveLength(2)
    expect(scenes.value[0].name).toBe('S1')
    expect(activeIndex.value).toBe(1)
  })

  it('hydrate stops playback', () => {
    const { add, startPlayback, playing, hydrate } = useScenes()
    add()
    add()
    startPlayback()
    hydrate({ scenes: [], activeIndex: -1 })
    expect(playing.value).toBe(false)
  })

  it('reset clears everything', () => {
    const { add, setActive, reset, scenes, activeIndex, playing } = useScenes()
    add()
    add()
    setActive(1)
    reset()
    expect(scenes.value).toEqual([])
    expect(activeIndex.value).toBe(-1)
    expect(playing.value).toBe(false)
  })

  describe('annotation visibility', () => {
    it('stores annotationVisibility on a scene', () => {
      const { scenes, add, update } = useScenes()
      add()
      const visibility = [
        { action: 'hide' as const, kind: 'point' as const, id: 'a1' },
      ]
      update(0, { annotationVisibility: visibility })
      expect(scenes.value[0].annotationVisibility).toEqual(visibility)
    })

    it('update merges annotationVisibility with other scene data', () => {
      const { scenes, add, update } = useScenes()
      add()
      update(0, { name: 'Scene 1' })
      update(0, {
        annotationVisibility: [
          { action: 'show' as const, kind: 'range' as const, id: 'r1' },
        ],
      })
      expect(scenes.value[0].name).toBe('Scene 1')
      expect(scenes.value[0].annotationVisibility).toEqual([
        { action: 'show', kind: 'range', id: 'r1' },
      ])
    })

    it('overwriting annotationVisibility replaces the array', () => {
      const { scenes, add, update } = useScenes()
      add()
      update(0, {
        annotationVisibility: [
          { action: 'hide' as const, kind: 'point' as const, id: 'a1' },
        ],
      })
      update(0, {
        annotationVisibility: [
          { action: 'show' as const, kind: 'free' as const, id: 'f1' },
          { action: 'hide' as const, kind: 'range' as const, id: 'r2' },
        ],
      })
      expect(scenes.value[0].annotationVisibility).toEqual([
        { action: 'show', kind: 'free', id: 'f1' },
        { action: 'hide', kind: 'range', id: 'r2' },
      ])
    })

    it('snapshot preserves annotationVisibility', () => {
      const { add, update, snapshot } = useScenes()
      add()
      const visibility = [
        { action: 'hide' as const, kind: 'point' as const, id: 'p1' },
      ]
      update(0, { annotationVisibility: visibility })
      const snap = snapshot()
      expect(snap.scenes[0].annotationVisibility).toEqual(visibility)
    })

    it('hydrate restores annotationVisibility', () => {
      const { scenes, hydrate } = useScenes()
      hydrate({
        scenes: [
          {
            id: 'x1',
            name: 'S1',
            annotationVisibility: [
              { action: 'show', kind: 'range', id: 'r1' },
            ],
          },
          {
            id: 'x2',
            name: 'S2',
            annotationVisibility: [
              { action: 'hide', kind: 'free', id: 'f1' },
            ],
          },
        ],
        activeIndex: 0,
      })
      expect(scenes.value).toHaveLength(2)
      expect(scenes.value[0].annotationVisibility).toEqual([
        { action: 'show', kind: 'range', id: 'r1' },
      ])
      expect(scenes.value[1].annotationVisibility).toEqual([
        { action: 'hide', kind: 'free', id: 'f1' },
      ])
    })

    it('removing a scene removes its annotationVisibility', () => {
      const { scenes, add, update, remove } = useScenes()
      add()
      update(0, {
        annotationVisibility: [
          { action: 'hide' as const, kind: 'point' as const, id: 'gone' },
        ],
      })
      remove(0)
      expect(scenes.value).toHaveLength(0)
    })

    it('stores annotations with ids on a scene', () => {
      const { scenes, add, update } = useScenes()
      add()
      const annotations = [
        { id: 'ann-1', kind: 'point' as const, x: 10, y: 20, label: 'Note A' },
        { id: 'ann-2', kind: 'range' as const, x: 30, x2: 50, label: 'Note B' },
      ]
      update(0, { annotations: annotations as AnnotationConfig[] })
      expect(scenes.value[0].annotations).toEqual(annotations)
    })

    it('reorder preserves annotationVisibility on scenes', () => {
      const { scenes, add, update, reorder } = useScenes()
      const id1 = add()
      const id2 = add()
      const vis1 = [{ action: 'hide' as const, kind: 'point' as const, id: 'p1' }]
      const vis2 = [{ action: 'show' as const, kind: 'free' as const, id: 'f1' }]
      update(0, { annotationVisibility: vis1 })
      update(1, { annotationVisibility: vis2 })
      reorder(0, 1)
      expect(scenes.value[0].id).toBe(id2)
      expect(scenes.value[0].annotationVisibility).toEqual(vis2)
      expect(scenes.value[1].id).toBe(id1)
      expect(scenes.value[1].annotationVisibility).toEqual(vis1)
    })
  })
})
