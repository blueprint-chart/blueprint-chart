import { darkSchemeQuery } from '../charts/themes'
import { parse } from '../dsl/parser'
import { CHART_CSS } from './chart-css'
import { ERROR_MESSAGE, RESIZE_MESSAGE, isErrorMessage, readResizeHeight } from './messages'
import { PLAYER_CSS } from './player-css'
import type { PlayerConfig, PlayerPosition, PlayerType } from './player'

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
const schemeUnsubscribers: Array<() => void> = []

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
  schemeUnsubscribers.splice(0).forEach(unsubscribe => unsubscribe())
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

  const hostTheme = script.closest('[data-bs-theme]')?.getAttribute('data-bs-theme')
  if (hostTheme === 'light' || hostTheme === 'dark') {
    iframe.srcdoc = buildSrcdoc(dsl, RUNTIME_URL, hostTheme)
  }
  else {
    const query = darkSchemeQuery()
    const applyScheme = () => {
      iframe.srcdoc = buildSrcdoc(dsl, RUNTIME_URL, query?.matches ? 'dark' : 'light')
    }
    applyScheme()
    if (query) {
      query.addEventListener('change', applyScheme)
      schemeUnsubscribers.push(() => query.removeEventListener('change', applyScheme))
    }
  }

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

/**
 * CSS-variable overrides applied to the chart frame inside the iframe, so a
 * host can theme the chart chrome (background, text, axis, grid) to match its
 * own surface. Omit for the default light chrome. Data-mark colors come from
 * the chart's palette and are not affected.
 */
export type EmbedTheme = 'light' | 'dark'

const PLAYER_TYPES: readonly PlayerType[] = ['buttons', 'progress-bar', 'dot-stepper', 'minimal-arrows']
const PLAYER_POSITIONS: readonly PlayerPosition[] = ['left', 'center', 'right']

function pickChoice<T extends string>(value: unknown, choices: readonly T[], fallback: T): T {
  const match = choices.find(choice => choice === value)
  return match ?? fallback
}

function readPlayerConfig(dsl: string): PlayerConfig | null {
  let ast
  try {
    ast = parse(dsl)
  }
  catch {
    // An unparsable chart renders its own error message; no player then.
    return null
  }
  const properties = new Map(ast.properties.map(property => [property.key, property.value]))
  const player = properties.get('player')
  if (!ast.scenes.length || player === 'none') {
    return null
  }
  const type = pickChoice(player, PLAYER_TYPES, 'buttons')
  const position = pickChoice(properties.get('playerPosition'), PLAYER_POSITIONS, 'left')
  return { type, position, total: ast.scenes.length + 1 }
}

export function buildSrcdoc(dsl: string, runtimeUrl: string, theme?: EmbedTheme): string {
  const runtimeScriptTag = runtimeUrl
    ? `<script src="${escapeAttr(runtimeUrl)}"></script>`
    : ''

  // The chart owns its theme colors (see CHART_CSS). We only flip the switch:
  // data-bs-theme="dark" activates the dark palette and, via the dark frame
  // background, the renderer's resolveBackgroundColor adapts data marks too.
  const htmlOpenTag = theme === 'dark' ? '<html data-bs-theme="dark">' : '<html>'

  const bootstrap = runtimeUrl
    ? [
        'try {',
        '  var chart = document.getElementById("chart");',
        '  window.BlueprintChart.renderBpc(chart, __BPC_SRC__);',
        '  if (__BPC_PLAYER__) {',
        '    window.BlueprintChart.mountScenePlayer(chart, __BPC_PLAYER__, function (step) {',
        '      window.BlueprintChart.renderBpc(chart, __BPC_SRC__, { sceneIndex: step > 1 ? step - 2 : undefined, transition: true });',
        '    });',
        '  }',
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
    `${htmlOpenTag}<head>`,
    `<style>${CHART_CSS}</style>`,
    `<style>${PLAYER_CSS}</style>`,
    '</head><body>',
    '<div id="chart" class="blueprint-chart-container"></div>',
    runtimeScriptTag,
    '<script>',
    `var __BPC_SRC__ = ${serializeForScript(dsl)};`,
    // Safe unescaped: only enum values and a number.
    `var __BPC_PLAYER__ = ${JSON.stringify(readPlayerConfig(dsl))};`,
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
