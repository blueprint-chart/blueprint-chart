import { CHART_CSS } from './chart-css'
import { ERROR_MESSAGE, RESIZE_MESSAGE, isErrorMessage, readResizeHeight } from './messages'

// URL of the currently-executing runtime bundle, captured at module eval time
// (valid while the IIFE runs synchronously on the host page). Each generated
// iframe reloads this same bundle so it can render in its own realm.
const RUNTIME_URL = detectRuntimeUrl()

function detectRuntimeUrl(): string {
  try {
    if (typeof globalThis !== 'undefined') {
      // Explicit override: `document.currentScript` is null when the runtime
      // is loaded as an ES module (`<script type="module">`) or via dynamic
      // import(), so module-form consumers set this global to the URL of the
      // self-contained IIFE bundle each iframe should load.
      const override = (globalThis as { BLUEPRINT_CHART_RUNTIME_URL?: unknown }).BLUEPRINT_CHART_RUNTIME_URL
      if (typeof override === 'string' && override) {
        return override
      }
    }
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
    const height = readResizeHeight(e.data)
    if (height !== null) {
      iframe.style.height = `${height}px`
      return
    }
    if (isErrorMessage(e.data)) {
      // The runtime failed to load or renderBpc threw. The host page owns the
      // surrounding UI, so surface the failure to the console rather than leave
      // a silently blank iframe with no diagnostic.
      console.warn('Blueprint Chart: could not render embed.', (e.data as { message?: unknown }).message)
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
        `  parent.postMessage({ type: "${ERROR_MESSAGE}", message: String(e) }, "*");`,
        '}',
      ]
    : [
        `parent.postMessage({ type: "${ERROR_MESSAGE}", message: "Blueprint Chart runtime URL unavailable" }, "*");`,
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
    `  parent.postMessage({ type: "${RESIZE_MESSAGE}", height: h }, "*");`,
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
