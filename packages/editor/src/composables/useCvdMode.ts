import { ref } from 'vue'

const cvdMode = ref('')

export function useCvdMode() {
  return { cvdMode }
}
