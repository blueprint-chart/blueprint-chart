import { CHART_CSS } from './chart-css'

// URL of the currently-executing runtime bundle, captured at module eval time
// (valid while the IIFE runs synchronously on the host page). Each generated
// iframe reloads this same bundle so it can render in its own realm.
const RUNTIME_URL = detectRuntimeUrl()

function detectRuntimeUrl(): string {
  try {
    if (typeof document === 'undefined') {
      return ''
    }
    return (document.currentScript as HTMLScriptElement | null)?.src ?? ''
  }
  catch {
    return ''
  }
}

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

  iframe.srcdoc = buildSrcdoc(dsl, RUNTIME_URL)

  const onMessage = (e: MessageEvent) => {
    if (e.data?.type === 'blueprint-chart-resize') {
      iframe.style.height = `${e.data.height}px`
    }
  }
  iframeHandlers.set(iframe, onMessage)
}

export function buildSrcdoc(dsl: string, runtimeUrl: string): string {
  const runtimeScriptTag = runtimeUrl
    ? `<script src="${escapeAttr(runtimeUrl)}"></script>`
    : ''

  const bootstrap = runtimeUrl
    ? [
        'try {',
        '  window.BlueprintChart.renderBpc(document.getElementById("chart"), __BPC_SRC__);',
        '}',
        'catch (e) {',
        '  parent.postMessage({ type: "blueprint-chart-error", message: String(e) }, "*");',
        '}',
      ]
    : [
        'parent.postMessage({ type: "blueprint-chart-error", message: "Blueprint Chart runtime URL unavailable" }, "*");',
      ]

  return [
    '<!DOCTYPE html>',
    '<html><head>',
    `<style>${CHART_CSS}</style>`,
    '</head><body>',
    '<div id="chart" class="blueprint-chart-container"></div>',
    runtimeScriptTag,
    '<script>',
    `var __BPC_SRC__ = ${serializeForScript(dsl)};`,
    'function notifySize() {',
    '  var h = document.documentElement.scrollHeight;',
    '  parent.postMessage({ type: "blueprint-chart-resize", height: h }, "*");',
    '}',
    ...bootstrap,
    'notifySize();',
    'new ResizeObserver(notifySize).observe(document.body);',
    '</' + 'script>',
    '</body></html>',
  ].filter(Boolean).join('\n')
}

// Serialize a string as a safe JS string literal for inlining into a <script>.
// JSON.stringify handles quoting/newlines; escaping `<` to < prevents a
// `</script>` (or `<!--`) sequence in the source from terminating the block.
function serializeForScript(value: string): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

// Escape a URL for safe use inside a double-quoted HTML attribute.
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
