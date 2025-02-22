export function initBlueprint(): void {
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    'script[type="application/blueprint-chart"]',
  )
  scripts.forEach(processScript)
}

function processScript(script: HTMLScriptElement): void {
  const dsl = script.textContent?.trim()
  if (!dsl) return

  const container = document.createElement('div')
  container.className = 'blueprint-chart-container'
  script.parentNode?.insertBefore(container, script)

  try {
    renderFromDsl(container, dsl)
  }
  catch (e) {
    renderError(container, (e as Error).message)
  }
}

function renderFromDsl(container: HTMLElement, dsl: string): void {
  // Placeholder: actual implementation will use parse() from dsl module
  // and getChart() from charts module once those are integrated
  const wrapper = document.createElement('div')
  wrapper.className = 'blueprint-chart-placeholder'
  wrapper.textContent = `${dsl.substring(0, 100)}...`
  container.appendChild(wrapper)
}

function renderError(container: HTMLElement, message: string): void {
  const wrapper = document.createElement('div')
  wrapper.className = 'blueprint-chart-error'
  wrapper.style.cssText = 'color: red; padding: 1em; border: 1px solid red;'
  wrapper.textContent = message
  container.appendChild(wrapper)
}
