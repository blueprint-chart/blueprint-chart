import { CHART_CSS } from './chart-css'

export function initBlueprint(): void {
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    'script[type="application/blueprint-chart"]',
  )
  scripts.forEach(processScript)
}

function processScript(script: HTMLScriptElement): void {
  const dsl = script.textContent?.trim()
  if (!dsl) return

  const iframe = document.createElement('iframe')
  iframe.className = 'blueprint-chart-iframe'
  iframe.style.cssText = 'border: none; width: 100%; display: block;'
  iframe.setAttribute('sandbox', 'allow-scripts')
  iframe.setAttribute('title', 'Blueprint Chart')

  script.parentNode?.insertBefore(iframe, script)

  iframe.srcdoc = buildSrcdoc(dsl)

  const onMessage = (e: MessageEvent) => {
    if (e.data?.type === 'blueprint-chart-resize' && e.source === iframe.contentWindow) {
      iframe.style.height = `${e.data.height}px`
    }
  }
  window.addEventListener('message', onMessage)
}

function buildSrcdoc(dsl: string): string {
  const escapedDsl = escapeHtml(dsl)

  return [
    '<!DOCTYPE html>',
    '<html><head>',
    `<style>${CHART_CSS}</style>`,
    '</head><body>',
    `<div id="chart" class="blueprint-chart-container blueprint-chart-placeholder">${escapedDsl}</div>`,
    '<script>',
    'function notifySize() {',
    '  var h = document.documentElement.scrollHeight;',
    '  parent.postMessage({ type: "blueprint-chart-resize", height: h }, "*");',
    '}',
    'notifySize();',
    'new ResizeObserver(notifySize).observe(document.body);',
    '</' + 'script>',
    '</body></html>',
  ].join('\n')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
