import * as d3 from 'd3'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import type { D3Blueprint, Plugin } from 'd3-blueprint'

const TOOLTIP_CLASS = 'bc-tooltip'

function ensureStyles(): void {
  if (document.getElementById('bc-tooltip-styles')) {
    return
  }
  const style = document.createElement('style')
  style.id = 'bc-tooltip-styles'
  style.textContent = `
    .${TOOLTIP_CLASS} {
      position: absolute;
      pointer-events: none;
      background: var(--bs-body-bg, #fff);
      color: var(--bs-body-color, #212529);
      border: 1px solid var(--bs-border-color, #dee2e6);
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 13px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      z-index: 9999;
      display: none;
    }
  `
  document.head.appendChild(style)
}

function defaultFormat(d: unknown): string {
  if (d && typeof d === 'object') {
    return formatObjectDatum(d)
  }
  return String(d)
}

function formatObjectDatum(d: object): string {
  // d3.PieArcDatum
  if ('data' in d && typeof (d as { data: unknown }).data === 'number') {
    return String((d as { data: number }).data)
  }
  const obj = d as Record<string, unknown>
  // Bar/line datum with label + value
  if ('label' in obj && 'value' in obj) {
    return `${obj.label}: ${obj.value}`
  }
  // Multi-bar datum
  if ('series' in obj && 'value' in obj) {
    return `${obj.series}: ${obj.value}`
  }
  if ('value' in obj) {
    return String(obj.value)
  }
  return String(d)
}

function showTooltip(
  el: SVGElement, tooltipEl: HTMLDivElement, fmt: (datum: unknown) => string,
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const datum = d3.select(el).datum() as any
  tooltipEl.textContent = fmt(datum)
  tooltipEl.style.display = 'block'

  computePosition(el, tooltipEl, {
    placement: 'top',
    middleware: [offset(8), flip(), shift()],
  }).then(({ x, y }) => {
    tooltipEl.style.left = `${x}px`
    tooltipEl.style.top = `${y}px`
  })
}

function attachTooltipListeners(
  el: SVGElement, tooltipEl: HTMLDivElement,
  fmt: (datum: unknown) => string, cleanups: (() => void)[],
): void {
  const onEnter = () => {
    if (tooltipEl) {
      showTooltip(el, tooltipEl, fmt)
    }
  }

  const onLeave = () => {
    if (tooltipEl) {
      tooltipEl.style.display = 'none'
    }
  }

  el.addEventListener('mouseenter', onEnter)
  el.addEventListener('mouseleave', onLeave)
  cleanups.push(() => {
    el.removeEventListener('mouseenter', onEnter)
    el.removeEventListener('mouseleave', onLeave)
  })
}

function createTooltipEl(): HTMLDivElement {
  ensureStyles()
  const el = document.createElement('div')
  el.className = TOOLTIP_CLASS
  document.body.appendChild(el)
  return el
}

function drawTooltips(
  chart: D3Blueprint, tooltipEl: HTMLDivElement,
  fmt: (datum: unknown) => string, cleanups: (() => void)[],
): void {
  const base = (chart as unknown as { base: d3.Selection<SVGElement, unknown, null, undefined> }).base
  const targets = base.selectAll<SVGElement, unknown>('.bc-bar, .bc-dot, .bc-arc')
  targets.each(function () {
    attachTooltipListeners(this, tooltipEl, fmt, cleanups)
  })
}

export function createTooltipPlugin(options?: {
  format?: (datum: unknown) => string
}): Plugin {
  const fmt = options?.format ?? defaultFormat
  let tooltipEl: HTMLDivElement | null = null
  const cleanups: (() => void)[] = []

  return {
    name: 'tooltip',
    install() { tooltipEl = createTooltipEl() },
    postDraw(chart: D3Blueprint) { drawTooltips(chart, tooltipEl!, fmt, cleanups) },
    destroy() {
      for (const cleanup of cleanups) {
        cleanup()
      }
      cleanups.length = 0
      if (tooltipEl) {
        tooltipEl.remove()
        tooltipEl = null
      }
    },
  }
}
