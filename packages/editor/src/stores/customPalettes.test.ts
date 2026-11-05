import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { CUSTOM_PALETTES_KEY, useCustomPalettes } from './customPalettes'

const seeded = { id: 'seed0000001', label: 'Seeded', colors: ['#112233', '#445566'] }

describe('useCustomPalettes', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('creates a palette and persists it', async () => {
    const { create } = useCustomPalettes()
    const palette = create('Mine', ['#112233', '#445566'])
    expect(palette).toMatchObject({ label: 'Mine', colors: ['#112233', '#445566'] })
    await nextTick()
    expect(JSON.parse(localStorage.getItem(CUSTOM_PALETTES_KEY)!)).toHaveLength(1)
  })

  it('loads saved palettes on first use', () => {
    localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify([seeded]))
    setActivePinia(createPinia())
    const { palettes } = useCustomPalettes()
    expect(palettes.value[0].label).toBe('Seeded')
  })

  it('rejects fewer than 2 or more than 12 colors', () => {
    const { create } = useCustomPalettes()
    expect(create('x', ['#112233'])).toBeNull()
    expect(create('x', Array(13).fill('#112233'))).toBeNull()
  })

  it('rejects invalid hex', () => {
    const { create } = useCustomPalettes()
    expect(create('x', ['blue', '#12'])).toBeNull()
    expect(localStorage.getItem(CUSTOM_PALETTES_KEY)).toBeNull()
  })

  it('falls back to [] on corrupt storage', () => {
    localStorage.setItem(CUSTOM_PALETTES_KEY, '{nope')
    setActivePinia(createPinia())
    const { palettes } = useCustomPalettes()
    expect(palettes.value).toEqual([])
  })

  it('falls back to [] on non-array storage', () => {
    localStorage.setItem(CUSTOM_PALETTES_KEY, '{"a":1}')
    setActivePinia(createPinia())
    const { palettes } = useCustomPalettes()
    expect(palettes.value).toEqual([])
  })

  it('update renames and recolors', async () => {
    const { create, update, palettes } = useCustomPalettes()
    const { id } = create('Mine', ['#112233', '#445566'])!
    expect(update(id, { label: 'Renamed', colors: ['#aabbcc', '#ddeeff', '#001122'] })).toBe(true)
    expect(palettes.value[0]).toEqual({ id, label: 'Renamed', colors: ['#aabbcc', '#ddeeff', '#001122'] })
    await nextTick()
    expect(JSON.parse(localStorage.getItem(CUSTOM_PALETTES_KEY)!)[0].label).toBe('Renamed')
  })

  it('update returns false for invalid colors', () => {
    const { create, update, palettes } = useCustomPalettes()
    const { id } = create('Mine', ['#112233', '#445566'])!
    expect(update(id, { colors: ['nope'] })).toBe(false)
    expect(palettes.value[0].colors).toEqual(['#112233', '#445566'])
  })

  it('remove deletes by id', async () => {
    const { create, remove, palettes } = useCustomPalettes()
    const { id } = create('Mine', ['#112233', '#445566'])!
    await nextTick()
    remove(id)
    await nextTick()
    expect(palettes.value).toEqual([])
    expect(JSON.parse(localStorage.getItem(CUSTOM_PALETTES_KEY)!)).toEqual([])
  })
})
