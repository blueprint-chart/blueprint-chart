export const useCvdModeStore = defineStore('cvdMode', () => {
  const cvdMode = shallowRef('')

  return { cvdMode }
})

export function useCvdMode() {
  const store = useCvdModeStore()
  const { cvdMode } = storeToRefs(store)
  return { cvdMode }
}
