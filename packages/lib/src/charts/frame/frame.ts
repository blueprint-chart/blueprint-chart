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
      .style('align-items', 'baseline')
      .style('flex-wrap', 'wrap')
      .style('gap', '0.25rem 1rem')
    const footerLeft = footer.append('div').attr('class', 'bc-frame-footer-left')
      .style('display', 'flex')
      .style('flex-wrap', 'wrap')
      .style('gap', '0.25rem 0.75rem')
    const footerRight = footer.append('div').attr('class', 'bc-frame-footer-right')

    this.layer('headerItems', header, {
      dataBind: (sel, data) => sel.selectAll('.bc-frame-header-item').data(data.headerItems),
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
      },
    })

    this.layer('footerLeftItems', footerLeft, {
      dataBind: (sel, data) => sel.selectAll('.bc-frame-footer-item').data(data.footerLeftItems),
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
      },
    })

    this.layer('footerRightItems', footerRight, {
      dataBind: (sel, data) => sel.selectAll('.bc-frame-footer-item').data(data.footerRightItems),
      insert: (sel) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return sel.append((d: any) => document.createElement(d.tag))
      },
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enter: (sel: any) => {
          sel
            .attr('class', (d: FooterItem) => d.className)
            .text((d: FooterItem) => d.text)
          sel.filter((d: FooterItem) => !!d.href)
            .attr('href', (d: FooterItem) => d.href!)
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

function buildFooterRightItems(options: FrameOptions): FooterItem[] {
  if (options.showCredit === false) {
    return []
  }
  return [{ tag: 'span', className: 'bc-frame-credit', text: 'Blueprint Chart' }]
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

  if (options.note) {
    note.textContent = options.note
  }
  else {
    note.style.display = 'none'
  }

  return { wrapper, header, body, footer }
}
