import { CHART_CSS } from './chart-css'

// Track the single message router so repeated init() calls don't accumulate
// `message` listeners on `window` (HMR, multi-script-tag pages, etc.).
const iframeHandlers = new Map<HTMLIFrameElement, (e: MessageEvent) => void>()
let rootMessageHandler: ((e: MessageEvent) => void) | null = null

function ensureRootMessageHandler(): void {
  if (rootMessageHandler) {
    return
  }
  rootMessageHandler = (e: MessageEvent) => {
    for (const [iframe, handler] of iframeHandlers) {
      if (e.source === iframe.contentWindow) {
        handler(e)
        return
      }
    }
  }
  window.addEventListener('message', rootMessageHandler)
}

export function initBlueprint(): void {
  ensureRootMessageHandler()
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    'script[type="application/blueprint-chart"]',
  )
  scripts.forEach(processScript)
}

export function teardownBlueprint(): void {
  if (rootMessageHandler) {
    window.removeEventListener('message', rootMessageHandler)
    rootMessageHandler = null
  }
  iframeHandlers.clear()
}

function processScript(script: HTMLScriptElement): void {
  const dsl = script.textContent?.trim()
  if (!dsl) {
    return
  }

  const iframe = document.createElement('iframe')
  iframe.className = 'blueprint-chart-iframe'
  iframe.style.cssText = 'border: none; width: 100%; display: block;'
  iframe.setAttribute('sandbox', 'allow-scripts')
  iframe.setAttribute('title', 'Blueprint Chart')

  script.parentNode?.insertBefore(iframe, script)

  iframe.srcdoc = buildSrcdoc(dsl)

  const onMessage = (e: MessageEvent) => {
    if (e.data?.type === 'blueprint-chart-resize') {
      iframe.style.height = `${e.data.height}px`
    }
  }
  iframeHandlers.set(iframe, onMessage)
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
