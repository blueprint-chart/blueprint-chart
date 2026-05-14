import * as d3 from 'd3'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import type { D3Blueprint, Plugin } from 'd3-blueprint'
import { buildNumberFormatter } from '../format-helpers'

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

export function makeDefaultFormat(numberFormat?: string): (d: unknown) => string {
  const fmtFn = numberFormat ? buildNumberFormatter(numberFormat) : null
  const fmtValue = (v: unknown) => typeof v === 'number' && fmtFn ? fmtFn(v) : String(v)

  return (d: unknown): string => {
    if (d && typeof d === 'object') {
      // d3.PieArcDatum
      if ('data' in d && typeof (d as { data: unknown }).data === 'number') {
        return fmtValue((d as { data: number }).data)
      }
      // Bar/line datum with label + value
      const obj = d as Record<string, unknown>
      if ('label' in obj && 'value' in obj) {
        return `${obj.label}: ${fmtValue(obj.value)}`
      }
      // Multi-bar datum
      if ('series' in obj && 'value' in obj) {
        return `${obj.series}: ${fmtValue(obj.value)}`
      }
      if ('value' in obj) {
        return fmtValue(obj.value)
      }
    }
    return String(d)
  }
}

export function createTooltipPlugin<TData = unknown>(options?: {
  format?: (datum: unknown) => string
  numberFormat?: string
}): Plugin<TData> {
  const fmt = options?.format ?? makeDefaultFormat(options?.numberFormat)
  let tooltipEl: HTMLDivElement | null = null
  const cleanups: (() => void)[] = []

  return {
    name: 'tooltip',

    install() {
      ensureStyles()
      tooltipEl = document.createElement('div')
      tooltipEl.className = TOOLTIP_CLASS
      document.body.appendChild(tooltipEl)
    },

    postDraw(chart: D3Blueprint<TData>) {
      const base = (chart as unknown as { base: d3.Selection<SVGElement, unknown, null, undefined> }).base

      const targets = base.selectAll<SVGElement, unknown>('.bc-bar, .bc-dot, .bc-arc')

      targets.each(function () {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const el = this

        const onEnter = () => {
          if (!tooltipEl) {
            return
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const datum = d3.select(el).datum() as any
          tooltipEl.textContent = fmt(datum)
          tooltipEl.style.display = 'block'

          computePosition(el, tooltipEl, {
            placement: 'top',
            middleware: [offset(8), flip(), shift()],
          }).then(({ x, y }) => {
            if (!tooltipEl) {
              return
            }
            tooltipEl.style.left = `${x}px`
            tooltipEl.style.top = `${y}px`
          })
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
      })
    },

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
