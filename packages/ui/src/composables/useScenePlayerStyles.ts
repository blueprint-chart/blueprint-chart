import { onMounted } from 'vue'
import { PLAYER_CSS } from '@blueprint-chart/lib/embed'

export function useScenePlayerStyles(): void {
  onMounted(() => {
    if (document.head.querySelector('style[data-bc-scene-player]')) {
      return
    }
    const style = document.createElement('style')
    style.setAttribute('data-bc-scene-player', '')
    style.textContent = PLAYER_CSS
    document.head.appendChild(style)
  })
}
