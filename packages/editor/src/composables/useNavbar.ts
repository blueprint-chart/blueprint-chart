import { reactive, toRefs } from 'vue'

export type NavbarMode = 'home' | 'wizard'

const state = reactive({
  mode: 'home' as NavbarMode,
})

export function useNavbar() {
  function setMode(mode: NavbarMode) {
    state.mode = mode
  }

  function reset() {
    state.mode = 'home'
  }

  return {
    ...toRefs(state),
    setMode,
    reset,
  }
}
