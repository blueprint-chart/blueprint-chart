import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { CATEGORY_COLORS_KEY, normalizeCategory, useCategoryColors } from './categoryColors'

const stored = () => JSON.parse(localStorage.getItem(CATEGORY_COLORS_KEY)!)

describe('useCategoryColors', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('normalizes by trimming and lowercasing', () => {
    expect(normalizeCategory('  France ')).toBe('france')
  })

  it('adds and persists', async () => {
    const { add } = useCategoryColors()
    expect(add('France', '#0055A4')).toBe(true)
    await nextTick()
    expect(stored()).toEqual([{ name: 'France', color: '#0055A4' }])
  })

  it('rejects duplicates ignoring case and spaces', () => {
    const { add, categoryColors } = useCategoryColors()
    add('France', '#0055A4')
    expect(add(' france ', '#000000')).toBe(false)
    expect(categoryColors.value).toHaveLength(1)
  })

  it('rejects empty name and invalid hex without saving', () => {
    const { add } = useCategoryColors()
    expect(add('  ', '#000000')).toBe(false)
    expect(add('Spain', 'red')).toBe(false)
    expect(localStorage.getItem(CATEGORY_COLORS_KEY)).toBeNull()
  })

  it('update changes color by normalized name', async () => {
    const { add, update, categoryColors } = useCategoryColors()
    add('France', '#0055A4')
    expect(update('FRANCE', '#111111')).toBe(true)
    expect(categoryColors.value[0].color).toBe('#111111')
    await nextTick()
    expect(stored()[0].color).toBe('#111111')
  })

  it('update returns false for unknown name or invalid hex', () => {
    const { add, update, categoryColors } = useCategoryColors()
    add('France', '#0055A4')
    expect(update('Spain', '#111111')).toBe(false)
    expect(update('France', 'nope')).toBe(false)
    expect(categoryColors.value[0].color).toBe('#0055A4')
  })

  it('remove by normalized name', async () => {
    const { add, remove, categoryColors } = useCategoryColors()
    add('France', '#0055A4')
    await nextTick()
    remove(' FRANCE ')
    await nextTick()
    expect(categoryColors.value).toEqual([])
    expect(stored()).toEqual([])
  })

  it('loads saved entries on first use', () => {
    localStorage.setItem(CATEGORY_COLORS_KEY, JSON.stringify([{ name: 'Italy', color: '#009246' }]))
    setActivePinia(createPinia())
    const { categoryColors } = useCategoryColors()
    expect(categoryColors.value[0].name).toBe('Italy')
  })

  it('falls back to [] on corrupt storage', () => {
    localStorage.setItem(CATEGORY_COLORS_KEY, '{nope')
    setActivePinia(createPinia())
    const { categoryColors } = useCategoryColors()
    expect(categoryColors.value).toEqual([])
  })

  it('falls back to [] on non-array storage', () => {
    localStorage.setItem(CATEGORY_COLORS_KEY, '{"a":1}')
    setActivePinia(createPinia())
    const { categoryColors } = useCategoryColors()
    expect(categoryColors.value).toEqual([])
  })
})
