// Pages with hundreds of tooltips mount slowly, so each one is mounted on the
// first hover or focus of its target and shown right away.
export function useLazyTooltip() {
  const mounted = shallowRef(false)
  const shown = shallowRef(false)

  function arm() {
    mounted.value = true
    shown.value = true
  }

  return { mounted, shown, arm }
}
