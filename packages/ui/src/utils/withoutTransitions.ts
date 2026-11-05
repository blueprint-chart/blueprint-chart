export function withoutTransitions(apply: () => void): void {
  const freeze = document.createElement('style')
  freeze.textContent = '*,*::before,*::after{transition:none!important}'
  document.head.appendChild(freeze)
  apply()
  // Reading a computed style forces the repaint with transitions still off
  globalThis.getComputedStyle(document.body).getPropertyValue('opacity')
  globalThis.requestAnimationFrame(() => freeze.remove())
}
