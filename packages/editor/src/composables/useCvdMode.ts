import { shallowRef } from 'vue'

const cvdMode = shallowRef('')

export function useCvdMode() {
  return { cvdMode }
}
