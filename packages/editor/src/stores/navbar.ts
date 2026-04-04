export type NavbarMode = 'home' | 'wizard'

export const useNavbarStore = defineStore('navbar', () => {
  const mode = ref<NavbarMode>('home')

  function setMode(value: NavbarMode) {
    mode.value = value
  }

  function reset() {
    mode.value = 'home'
  }

  return {
    mode,
    setMode,
    reset,
  }
})

export function useNavbar() {
  const store = useNavbarStore()
  const { mode } = storeToRefs(store)
  return {
    mode,
    setMode: store.setMode,
    reset: store.reset,
  }
}
