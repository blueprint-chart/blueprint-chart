import * as d3 from 'd3'
import 'd3-transition'
import { VerticalAxisChart } from './vertical-axis'
import { HorizontalAxisChart, type AnyXScale } from './horizontal-axis'
import type { AxisOptions } from '../types'
import { getDefaultTransitionMs } from '../motion'

function isOrdinalScale(scale: AnyXScale): scale is d3.ScaleBand<string> | d3.ScalePoint<string> {
  return typeof (scale as d3.ScaleBand<string>).step === 'function'
}

export interface AxisServiceConfig {
  vertical?: {
    scale: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number> | d3.ScaleBand<string>
    height: number
    options: AxisOptions
  }
  horizontal?: {
    scale: AnyXScale
    height: number
    options: AxisOptions
  }
  order?: 'vertical-first' | 'horizontal-first'
}

const instances = new WeakMap<HTMLElement, AxisService>()

export class AxisService {
  private vGroup: SVGGElement | null = null
  private hGroup: SVGGElement | null = null
  private vChart: VerticalAxisChart | null = null
  private hChart: HorizontalAxisChart | null = null
  private container: HTMLElement
  private initialized = false

  private constructor(container: HTMLElement) {
    this.container = container
  }

  static for(container: HTMLElement): AxisService {
    let instance = instances.get(container)
    if (!instance) {
      instance = new AxisService(container)
      instances.set(container, instance)
    }
    return instance
  }

  static clear(container: HTMLElement): void {
    instances.delete(container)
  }

  /**
   * Remove axis groups from DOM before replaceChildren().
   * The groups are kept in memory for reattachment.
   */
  detach(): void {
    if (this.vGroup?.parentNode) {
      this.vGroup.querySelectorAll('.bc-grid-line').forEach(el => el.remove())
      this.vGroup.remove()
    }
    if (this.hGroup?.parentNode) {
      this.hGroup.querySelectorAll('.bc-grid-line').forEach(el => el.remove())
      this.hGroup.remove()
    }
  }

  /**
   * Insert axis wrapper groups into the given chartArea.
   * On first call, creates new D3Blueprint instances.
   * On subsequent calls, reinserts the existing groups.
   *
   * When marginDelta is provided (dx/dy from previous to current margin),
   * axis groups are wrapped in a compensating transform that transitions
   * to identity, preventing visual jumps when the chartArea origin shifts.
   */
  attach(chartArea: SVGGElement, marginDelta?: { dx: number, dy: number }): void {
    if (!this.initialized) {
      // First time — create wrapper groups and D3Blueprint instances
      this.vGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      this.vGroup.setAttribute('class', 'bc-axis-service-v')
      this.hGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      this.hGroup.setAttribute('class', 'bc-axis-service-h')

      chartArea.appendChild(this.vGroup)
      chartArea.appendChild(this.hGroup)

      this.vChart = new VerticalAxisChart(d3.select(this.vGroup))
      this.hChart = new HorizontalAxisChart(d3.select(this.hGroup))

      this.initialized = true
    }
    else {
      // Interrupt any pending D3 transitions and remove stale tick elements before
      // reinserting, to prevent ghost tick marks when tickValues change on resize
      // or between scene transitions.
      for (const group of [this.vGroup!, this.hGroup!]) {
        d3.select(group).selectAll<SVGGElement, unknown>('.tick').interrupt().remove()
      }

      // Reinsert existing groups into the new chartArea
      chartArea.appendChild(this.vGroup!)
      chartArea.appendChild(this.hGroup!)

      // Apply compensating transform for margin delta
      if (marginDelta && (marginDelta.dx !== 0 || marginDelta.dy !== 0)) {
        const { dx, dy } = marginDelta
        for (const group of [this.vGroup!, this.hGroup!]) {
          group.setAttribute('transform', `translate(${dx},${dy})`)
          const duration = getDefaultTransitionMs()
          if (duration > 0) {
            // Use attrTween with string interpolation to avoid D3's SVG
            // transform parsing (which reads baseVal, unsupported in jsdom)
            d3.select(group)
              .transition()
              .duration(duration)
              .attrTween('transform', () => {
                const ix = d3.interpolateNumber(dx, 0)
                const iy = d3.interpolateNumber(dy, 0)
                return (t: number) => `translate(${ix(t)},${iy(t)})`
              })
          }
          else {
            group.removeAttribute('transform')
          }
        }
      }
    }
  }

  /**
   * Configure and draw both axes.
   */
  update(config: AxisServiceConfig): void {
    const order = config.order ?? 'vertical-first'

    if (order === 'horizontal-first') {
      this.updateHorizontal(config.horizontal)
      this.updateVertical(config.vertical)
    }
    else {
      this.updateVertical(config.vertical)
      this.updateHorizontal(config.horizontal)
    }

    // Reorder DOM to match desired order
    if (order === 'horizontal-first') {
      if (this.hGroup && this.vGroup && this.hGroup.parentNode) {
        this.hGroup.parentNode.insertBefore(this.hGroup, this.vGroup)
      }
    }
    else {
      if (this.vGroup && this.hGroup && this.vGroup.parentNode) {
        this.vGroup.parentNode.insertBefore(this.vGroup, this.hGroup)
      }
    }
  }

  private updateVertical(cfg?: AxisServiceConfig['vertical']): void {
    if (!this.vChart || !this.vGroup) {
      return
    }

    if (!cfg) {
      // No vertical axis config — hide
      this.vGroup.style.display = 'none'
      return
    }

    this.vGroup.style.display = ''
    const opts = cfg.options

    this.vChart.config({
      scale: cfg.scale,
      direction: opts.direction ?? 'left',
      showAxis: opts.showAxis ?? true,
      showTicks: opts.showTicks ?? false,
      gridStyle: opts.gridStyle ?? 'dashed',
      gridWidth: opts.gridWidth ?? 0,
      height: cfg.height,
      ticks: opts.ticks ?? null,
      numberFormat: opts.numberFormat ?? null,
      labelPosition: opts.labelPosition ?? 'auto',
      topPadding: opts.topPadding ?? 0,
      tickFormat: opts.tickFormat ?? null,
    })
    this.vChart.draw([{ placeholder: true }])

    // Apply right-direction transform
    const el = this.vGroup.querySelector('.bc-axis-vertical') as SVGGElement | null
    if (el && (opts.direction ?? 'left') === 'right') {
      el.setAttribute('transform', `translate(${opts.gridWidth ?? 0},0)`)
    }
    else if (el) {
      el.removeAttribute('transform')
    }
  }

  private updateHorizontal(cfg?: AxisServiceConfig['horizontal']): void {
    if (!this.hChart || !this.hGroup) {
      return
    }

    if (!cfg) {
      // No horizontal axis config — hide
      this.hGroup.style.display = 'none'
      return
    }

    this.hGroup.style.display = ''
    const opts = cfg.options
    const scale = cfg.scale

    // Extract labels from ordinal scale domain
    const labels = isOrdinalScale(scale) ? scale.domain() : []

    this.hChart.config({
      scale,
      height: cfg.height,
      tickPosition: opts.tickPosition ?? 'below',
      showAxis: opts.showAxis ?? true,
      showTicks: opts.showTicks ?? false,
      gridStyle: opts.gridStyle ?? 'dashed',
      ticks: opts.ticks ?? null,
      numberFormat: opts.numberFormat ?? null,
      width: opts.width ?? 0,
      labels,
      labelPosition: opts.labelPosition ?? 'auto',
      labelRotation: opts.labelRotation ?? 'auto',
      zeroY: opts.zeroY ?? null,
      tickFormat: opts.tickFormat ?? null,
    })
    this.hChart.draw([{ placeholder: true }])
  }

  /**
   * Tear down the service and remove from the WeakMap.
   */
  destroy(): void {
    this.detach()
    this.vChart = null
    this.hChart = null
    this.vGroup = null
    this.hGroup = null
    this.initialized = false
    instances.delete(this.container)
  }
}
