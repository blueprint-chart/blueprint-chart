import { useLocalStorage } from '@vueuse/core'
import { generateId } from './chartSession'

export interface CustomPalette {
  id: string
  label: string
  colors: string[]
}

export const CUSTOM_PALETTES_KEY = 'blueprint-chart:palettes'

const HEX = /^#[0-9a-f]{6}$/i

const isValidColors = (colors: readonly string[]) =>
  colors.length >= 2 && colors.length <= 12 && colors.every(c => HEX.test(c))

const isValidLabel = (label: string) => label.trim().length > 0

export const useCustomPalettesStore = defineStore('customPalettes', () => {
  const stored = useLocalStorage<CustomPalette[]>(CUSTOM_PALETTES_KEY, [], { writeDefaults: false })
  const palettes = computed(() => Array.isArray(stored.value) ? stored.value : [])

  function create(label: string, colors: readonly string[]): CustomPalette | null {
    if (!isValidLabel(label) || !isValidColors(colors)) {
      return null
    }
    const palette = { id: generateId(), label: label.trim(), colors: [...colors] }
    stored.value = [...palettes.value, palette]
    return palette
  }

  function update(id: string, patch: Partial<Pick<CustomPalette, 'label' | 'colors'>>): boolean {
    const current = palettes.value.find(p => p.id === id)
    if (!current) {
      return false
    }
    const next = { ...current, ...patch }
    if (!isValidLabel(next.label) || !isValidColors(next.colors)) {
      return false
    }
    stored.value = palettes.value.map(p => p.id === id ? { ...next, label: next.label.trim() } : p)
    return true
  }

  function remove(id: string) {
    stored.value = palettes.value.filter(p => p.id !== id)
  }

  return { palettes: readonly(palettes), create, update, remove }
})

export function useCustomPalettes() {
  const store = useCustomPalettesStore()
  const { palettes } = storeToRefs(store)
  return { palettes, create: store.create, update: store.update, remove: store.remove }
}
