import { useLocalStorage } from '@vueuse/core'
import { isHexColor, type ColorSwatchGroup } from '@blueprint-chart/ui'
import { CATEGORY_COLORS_KEY } from './storageKeys'

export { CATEGORY_COLORS_KEY }

export interface CategoryColor {
  name: string
  color: string
}

export const normalizeCategory = (name: string) => name.trim().toLowerCase()

export const useCategoryColorsStore = defineStore('categoryColors', () => {
  const stored = useLocalStorage<CategoryColor[]>(CATEGORY_COLORS_KEY, [], { writeDefaults: false })
  const categoryColors = computed(() => Array.isArray(stored.value) ? stored.value : [])

  const indexOf = (name: string) => categoryColors.value.findIndex(c => normalizeCategory(c.name) === normalizeCategory(name))

  function add(name: string, color: string): boolean {
    if (!normalizeCategory(name) || !isHexColor(color) || indexOf(name) !== -1) {
      return false
    }
    stored.value = [...categoryColors.value, { name: name.trim(), color }]
    return true
  }

  function update(name: string, color: string): boolean {
    const index = indexOf(name)
    if (index === -1 || !isHexColor(color)) {
      return false
    }
    stored.value = categoryColors.value.map((c, i) => i === index ? { ...c, color } : c)
    return true
  }

  function remove(name: string) {
    stored.value = categoryColors.value.filter(c => normalizeCategory(c.name) !== normalizeCategory(name))
  }

  return { categoryColors: readonly(categoryColors), add, update, remove }
})

export function useCategoryColors() {
  const store = useCategoryColorsStore()
  const { categoryColors } = storeToRefs(store)
  return { categoryColors, add: store.add, update: store.update, remove: store.remove }
}

export function useCategoryColorSwatchGroups() {
  const { categoryColors } = useCategoryColors()
  return computed<ColorSwatchGroup[]>(() => [
    { label: 'Category colors', swatches: categoryColors.value },
  ])
}
