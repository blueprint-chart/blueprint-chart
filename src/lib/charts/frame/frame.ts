import type { FrameOptions } from '../types'

export interface FrameElements {
  wrapper: HTMLElement
  header: HTMLElement
  body: HTMLElement
  footer: HTMLElement
}

export function createFrame(
  container: HTMLElement,
  options: FrameOptions = {},
): FrameElements {
  const wrapper = document.createElement('div')
  wrapper.className = 'bc-frame'

  const header = document.createElement('div')
  header.className = 'bc-frame-header'

  if (options.title) {
    const title = document.createElement('h3')
    title.className = 'bc-frame-title'
    title.textContent = options.title
    header.appendChild(title)
  }

  if (options.description) {
    const desc = document.createElement('p')
    desc.className = 'bc-frame-description'
    desc.textContent = options.description
    header.appendChild(desc)
  }

  if (options.byline) {
    const byline = document.createElement('small')
    byline.className = 'bc-frame-byline'
    byline.textContent = options.byline
    header.appendChild(byline)
  }

  wrapper.appendChild(header)

  const body = document.createElement('div')
  body.className = 'bc-frame-body'
  wrapper.appendChild(body)

  const footer = document.createElement('div')
  footer.className = 'bc-frame-footer'

  if (options.source) {
    if (options.sourceUrl) {
      const link = document.createElement('a')
      link.className = 'bc-frame-source'
      link.href = options.sourceUrl
      link.textContent = options.source
      footer.appendChild(link)
    }
    else {
      const span = document.createElement('span')
      span.className = 'bc-frame-source'
      span.textContent = options.source
      footer.appendChild(span)
    }
  }

  const credit = document.createElement('span')
  credit.className = 'bc-frame-credit'
  credit.textContent = 'Blueprint Chart'
  footer.appendChild(credit)

  wrapper.appendChild(footer)
  container.appendChild(wrapper)

  return { wrapper, header, body, footer }
}
