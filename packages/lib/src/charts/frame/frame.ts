import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { FrameOptions } from '../types'

export interface FrameElements {
  wrapper: HTMLElement
  header: HTMLElement
  body: HTMLElement
  footer: HTMLElement
}

interface HeaderItem {
  tag: string
  className: string
  text: string
}

interface FooterItem {
  tag: string
  className: string
  text: string
  href?: string
  prefix?: string
  html?: string
}

interface FrameData {
  headerItems: HeaderItem[]
  footerLeftItems: FooterItem[]
  footerRightItems: FooterItem[]
}

class FrameChart extends D3Blueprint<FrameData> {
  initialize() {
    const wrapper = this.base.append('div').attr('class', 'bc-frame')
    const header = wrapper.append('div').attr('class', 'bc-frame-header')
    wrapper.append('div').attr('class', 'bc-frame-body')
    wrapper.append('p').attr('class', 'bc-frame-note')
    const footer = wrapper.append('div').attr('class', 'bc-frame-footer')
      .style('display', 'flex')
      .style('justify-content', 'space-between')
      .style('align-items', 'center')
      .style('flex-wrap', 'wrap')
      .style('gap', '0.25rem 1rem')
    const footerLeft = footer.append('div').attr('class', 'bc-frame-footer-left')
      .style('display', 'flex')
      .style('flex-wrap', 'wrap')
      .style('gap', '0.25rem 0.75rem')
    const footerRight = footer.append('div').attr('class', 'bc-frame-footer-right')
      .style('display', 'flex')
      .style('align-items', 'center')

    this.layer('headerItems', header, {
      dataBind: (sel, data) => sel.selectAll('.bc-frame-header-item').data(data.headerItems, (d: HeaderItem) => d.className),
      insert: (sel) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return sel.append((d: any) => document.createElement(d.tag))
      },
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enter: (sel: any) => {
          sel
            .attr('class', (d: HeaderItem) => d.className)
            .text((d: HeaderItem) => d.text)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        merge: (sel: any) => {
          sel
            .attr('class', (d: HeaderItem) => d.className)
            .text((d: HeaderItem) => d.text)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exit: (sel: any) => {
          sel.remove()
        },
      },
    })

    this.layer('footerLeftItems', footerLeft, {
      dataBind: (sel, data) => sel.selectAll('.bc-frame-footer-item').data(data.footerLeftItems, (d: FooterItem) => d.className),
      insert: (sel) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return sel.append((d: any) => document.createElement(d.tag))
      },
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enter: (sel: any) => {
          sel
            .attr('class', (d: FooterItem) => d.className)
            .each(function (this: HTMLElement, d: FooterItem) {
              this.textContent = ''
              if (d.prefix) {
                const prefixEl = document.createElement('span')
                prefixEl.className = 'bc-frame-source-prefix'
                prefixEl.textContent = d.prefix
                this.appendChild(prefixEl)
              }
              if (d.href) {
                const link = document.createElement('a')
                link.className = 'bc-frame-source-link'
                link.href = d.href
                link.textContent = d.text
                this.appendChild(link)
              }
              else {
                this.appendChild(document.createTextNode(d.text))
              }
            })
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        merge: (sel: any) => {
          sel
            .attr('class', (d: FooterItem) => d.className)
            .each(function (this: HTMLElement, d: FooterItem) {
              this.textContent = ''
              if (d.prefix) {
                const prefixEl = document.createElement('span')
                prefixEl.className = 'bc-frame-source-prefix'
                prefixEl.textContent = d.prefix
                this.appendChild(prefixEl)
              }
              if (d.href) {
                const link = document.createElement('a')
                link.className = 'bc-frame-source-link'
                link.href = d.href
                link.textContent = d.text
                this.appendChild(link)
              }
              else {
                this.appendChild(document.createTextNode(d.text))
              }
            })
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exit: (sel: any) => {
          sel.remove()
        },
      },
    })

    this.layer('footerRightItems', footerRight, {
      dataBind: (sel, data) => sel.selectAll('.bc-frame-footer-item').data(data.footerRightItems, (d: FooterItem) => d.className),
      insert: (sel) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return sel.append((d: any) => document.createElement(d.tag))
      },
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enter: (sel: any) => {
          sel
            .attr('class', (d: FooterItem) => d.className)
            .each(function (this: HTMLElement, d: FooterItem) {
              if (d.html) {
                const range = document.createRange()
                const fragment = range.createContextualFragment(d.html)
                this.appendChild(fragment)
              }
              else {
                this.textContent = d.text
              }
            })
          sel.filter((d: FooterItem) => !!d.href)
            .attr('href', (d: FooterItem) => d.href!)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        merge: (sel: any) => {
          sel
            .attr('class', (d: FooterItem) => d.className)
            .each(function (this: HTMLElement, d: FooterItem) {
              this.textContent = ''
              if (d.html) {
                const range = document.createRange()
                const fragment = range.createContextualFragment(d.html)
                this.appendChild(fragment)
              }
              else {
                this.textContent = d.text
              }
            })
          sel.filter((d: FooterItem) => !!d.href)
            .attr('href', (d: FooterItem) => d.href!)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exit: (sel: any) => {
          sel.remove()
        },
      },
    })
  }
}

function buildHeaderItems(options: FrameOptions): HeaderItem[] {
  const items: HeaderItem[] = []
  if (options.title) {
    items.push({ tag: 'h3', className: 'bc-frame-title', text: options.title })
  }
  if (options.description) {
    items.push({ tag: 'p', className: 'bc-frame-description', text: options.description })
  }
  return items
}

function buildFooterLeftItems(options: FrameOptions): FooterItem[] {
  const items: FooterItem[] = []
  if (options.byline) {
    items.push({ tag: 'span', className: 'bc-frame-byline', text: options.byline })
  }
  if (options.source) {
    items.push({
      tag: 'span',
      className: 'bc-frame-source',
      text: options.source,
      prefix: 'Source: ',
      href: options.sourceUrl || undefined,
    })
  }
  return items
}

const CREDIT_LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48.042969 90.607422" width="10" height="18" style="vertical-align:-3px;margin-right:3px"><path fill="currentColor" opacity="0.55" d="M 20.042969 34.607422 A 28 28 0 0 1 23.072266 34.779297 A 28 28 0 0 0 20.042969 34.607422 z M 23.34375 34.810547 A 28 28 0 0 1 26.171875 35.292969 A 28 28 0 0 0 23.34375 34.810547 z M 16.570312 34.84375 A 28 28 0 0 0 15.474609 35.033203 A 28 28 0 0 1 16.570312 34.84375 z M 26.390625 35.341797 A 28 28 0 0 1 29.316406 36.189453 A 28 28 0 0 0 26.390625 35.341797 z M 13.128906 35.511719 A 28 28 0 0 0 11.904297 35.873047 A 28 28 0 0 1 13.128906 35.511719 z M 29.373047 36.210938 A 28 28 0 0 1 32.103516 37.347656 A 28 28 0 0 0 29.373047 36.210938 z M 9.7832031 36.609375 A 28 28 0 0 0 8.5820312 37.117188 A 28 28 0 0 1 9.7832031 36.609375 z M 32.392578 37.486328 A 28 28 0 0 1 34.939453 38.90625 A 28 28 0 0 0 32.392578 37.486328 z M 6.5742188 38.128906 A 28 28 0 0 0 5.4511719 38.765625 A 28 28 0 0 1 6.5742188 38.128906 z M 35.041016 38.966797 A 28 28 0 0 1 37.523438 40.738281 A 28 28 0 0 0 35.041016 38.966797 z M 3.5273438 40.080078 A 28 28 0 0 0 2.5761719 40.771484 A 28 28 0 0 1 3.5273438 40.080078 z M 37.658203 40.851562 A 28 28 0 0 1 39.804688 42.783203 A 28 28 0 0 0 37.658203 40.851562 z M 40.011719 42.990234 A 28 28 0 0 1 42.013672 45.251953 A 28 28 0 0 0 40.011719 42.990234 z M 42.013672 45.251953 A 28 28 0 0 1 20.042969 56 A 28 28 0 0 1 14.232422 55.3125 A 16 16 0 0 1 16 62.607422 A 16 16 0 0 1 0 78.607422 L 0 82.121094 A 28 28 0 0 0 20.042969 90.607422 A 28 28 0 0 0 48.042969 62.607422 A 28 28 0 0 0 42.013672 45.251953 z M 1.3007812 46.667969 A 16 16 0 0 1 1.6191406 46.697266 A 16 16 0 0 0 1.3007812 46.667969 z M 4.2558594 47.189453 A 16 16 0 0 1 4.4355469 47.242188 A 16 16 0 0 0 4.2558594 47.189453 z "/><path fill="currentColor" opacity="0.85" d="M 6.0637516 38.376047 A 28 28 0 0 1 20.042969 34.615234 A 28 28 0 0 1 42.013672 45.259765 A 28 28 0 0 0 48.042969 28.007812 A 28 28 0 0 0 20.042969 0.0078125 A 28 28 0 0 0 0 8.4941407 L 0 16.007812 A 12 12 0 0 1 12 28.007812 A 12 12 0 0 1 6.0613693 38.364443 "/><path fill="currentColor" d="M 20.042969 34.607422 A 28 28 0 0 0 5.0878906 38.970703 A 28 28 0 0 1 6.0644531 38.376953 L 6.0605469 38.365234 A 12 12 0 0 1 0 40.007812 L 0 43.09375 L 0 43.101562 L 0 46.607422 A 16 16 0 0 1 2.8847656 46.873047 A 16 16 0 0 1 2.9199219 46.878906 A 16 16 0 0 1 5.7011719 47.662109 A 16 16 0 0 1 5.7324219 47.673828 A 16 16 0 0 1 8.3300781 48.955078 A 16 16 0 0 1 8.3398438 48.958984 A 16 16 0 0 1 8.3457031 48.962891 A 16 16 0 0 1 10.662109 50.6875 A 16 16 0 0 1 10.697266 50.71875 A 16 16 0 0 1 12.660156 52.837891 A 16 16 0 0 1 12.667969 52.845703 A 16 16 0 0 1 12.673828 52.855469 A 16 16 0 0 1 14.228516 55.306641 A 16 16 0 0 1 14.232422 55.3125 A 28 28 0 0 0 20.042969 56 A 28 28 0 0 0 42.013672 45.251953 A 28 28 0 0 0 20.042969 34.607422 z M 4.7695312 39.177734 A 28 28 0 0 0 2.5390625 40.798828 A 28 28 0 0 1 4.7695312 39.177734 z M 2.1816406 41.091797 A 28 28 0 0 0 0.11914062 42.984375 A 28 28 0 0 1 2.1816406 41.091797 z "/></svg>'

function buildFooterRightItems(options: FrameOptions): FooterItem[] {
  if (options.showCredit === false) {
    return []
  }
  return [{ tag: 'span', className: 'bc-frame-credit', text: 'Blueprint Chart', html: CREDIT_LOGO_SVG + 'Blueprint Chart' }]
}

export function createFrame(
  container: HTMLElement,
  options: FrameOptions = {},
): FrameElements {
  const chart = new FrameChart(d3.select(container))
  chart.draw({
    headerItems: buildHeaderItems(options),
    footerLeftItems: buildFooterLeftItems(options),
    footerRightItems: buildFooterRightItems(options),
  })

  const wrapper = container.querySelector('.bc-frame') as HTMLElement
  const header = wrapper.querySelector('.bc-frame-header') as HTMLElement
  const body = wrapper.querySelector('.bc-frame-body') as HTMLElement
  const note = wrapper.querySelector('.bc-frame-note') as HTMLElement
  const footer = wrapper.querySelector('.bc-frame-footer') as HTMLElement

  if (options.padding) {
    wrapper.style.setProperty('--bc-frame-padding', options.padding)
  }

  if (options.note) {
    note.textContent = options.note
  }
  else {
    note.style.display = 'none'
  }

  // Auto-detect constrained-height mode: if the container has an explicit
  // aspect-ratio or is a flex column, apply the constrained class so the
  // body fills the remaining space. This must happen before createCanvas.
  if (container.isConnected) {
    const cs = getComputedStyle(container)
    const hasAspect = cs.aspectRatio && cs.aspectRatio !== 'auto' && cs.aspectRatio !== ''
    const isFlexCol = cs.display === 'flex' && cs.flexDirection === 'column'
    if (hasAspect || isFlexCol) {
      wrapper.classList.add('bc-frame--constrained')
    }
  }

  return { wrapper, header, body, footer }
}

/**
 * Measure header and footer heights and set CSS custom properties on the frame
 * so the absolutely-positioned body fills the remaining space.
 * Call this after rendering and after any DOM change that affects header/footer size
 * (e.g. scene player teleport into footer).
 */
export function updateConstrainedLayout(frame: HTMLElement): void {
  const header = frame.querySelector('.bc-frame-header') as HTMLElement | null
  const footer = frame.querySelector('.bc-frame-footer') as HTMLElement | null
  const note = frame.querySelector('.bc-frame-note') as HTMLElement | null

  const topH = header ? header.offsetHeight : 0
  const bottomH = (footer ? footer.offsetHeight : 0) + (note && note.style.display !== 'none' ? note.offsetHeight : 0)

  frame.style.setProperty('--bc-body-top', `${topH}px`)
  frame.style.setProperty('--bc-body-bottom', `${bottomH}px`)
}
