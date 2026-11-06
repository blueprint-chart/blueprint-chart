import type { Ref } from 'vue'
import { expandHexColor } from '../utils/expandHexColor'
import { isHexColor } from '../utils/isHexColor'

export function useHexColorField(model: Ref<string>) {
  function onHexInput(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim()
    if (isHexColor(value)) {
      model.value = value
    }
  }

  function onHexChange(event: Event) {
    const input = event.target as HTMLInputElement
    const color = expandHexColor(input.value.trim())
    if (color) {
      model.value = color
    }
    input.value = color ?? model.value
  }

  return { onHexInput, onHexChange }
}
