export const usePersistenceSmokeStore = defineStore('persistenceSmoke', () => {
  const value = shallowRef<string>('initial')

  function set(next: string) {
    value.value = next
  }

  function reset() {
    value.value = 'initial'
  }

  return { value, set, reset }
}, {
  persist: true,
})
