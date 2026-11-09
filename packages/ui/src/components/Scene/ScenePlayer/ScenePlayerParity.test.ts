import { mount } from '@vue/test-utils'
import { mountScenePlayer } from '@blueprint-chart/lib/runtime'
import ScenePlayerButtons from './ScenePlayerButtons.vue'
import ScenePlayerProgressBar from './ScenePlayerProgressBar.vue'
import ScenePlayerDotStepper from './ScenePlayerDotStepper.vue'
import ScenePlayerMinimalArrows from './ScenePlayerMinimalArrows.vue'

type PlayerType = 'buttons' | 'progress-bar' | 'dot-stepper' | 'minimal-arrows'
type Position = 'left' | 'center' | 'right'

const VUE = {
  'buttons': ScenePlayerButtons,
  'progress-bar': ScenePlayerProgressBar,
  'dot-stepper': ScenePlayerDotStepper,
  'minimal-arrows': ScenePlayerMinimalArrows,
}
const TYPES = Object.keys(VUE) as PlayerType[]
const POSITIONS: Position[] = ['left', 'center', 'right']
const TOTAL = 4

// Tag, sorted classes, sorted attributes, collapsed text; drops comments and
// whitespace-only text so Vue's <!--v-if--> and template indentation don't count.
function normalize(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.nodeValue ?? '').replace(/\s+/g, ' ').trim()
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ''
  }
  const element = node as Element
  const attributes = Array.from(element.attributes)
    .map(({ name, value }) => (name === 'class' ? `class="${value.split(/\s+/).filter(Boolean).sort().join(' ')}"` : `${name}="${value}"`))
    .sort()
    .join(' ')
  const children = Array.from(element.childNodes).map(normalize).filter(Boolean).join('')
  return `<${element.tagName.toLowerCase()} ${attributes}>${children}</${element.tagName.toLowerCase()}>`
}

function mountEmbed(type: PlayerType, position: Position) {
  const chart = document.createElement('div')
  chart.innerHTML = '<div class="bc-frame-footer"></div>'
  document.body.appendChild(chart)
  mountScenePlayer(chart, { type, position, total: TOTAL }, () => {})
  return chart.querySelector('[data-scene-player]') as HTMLElement
}

function vueMarkup(type: PlayerType, position: Position, current: number, playing = false): string {
  const wrapper = mount(VUE[type], { props: { total: TOTAL, current, position, playing } })
  return normalize(wrapper.element)
}

function goNext(root: HTMLElement, type: PlayerType) {
  const next = type === 'progress-bar'
    ? root.querySelector<HTMLElement>('[aria-current="step"] + .bc-scene-player__segments__segment')
    : root.querySelector<HTMLElement>('[aria-label="Next scene"]')
  next!.click()
}

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe.each(TYPES)('%s parity', (type) => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it.each(POSITIONS)('matches the Vue player at %s on step 1, after Next, and at the last step', (position) => {
    const root = mountEmbed(type, position)
    expect(normalize(root)).toBe(vueMarkup(type, position, 1))
    goNext(root, type)
    expect(normalize(root)).toBe(vueMarkup(type, position, 2))
    goNext(root, type)
    goNext(root, type)
    expect(normalize(root)).toBe(vueMarkup(type, position, TOTAL))
  })

  it.skipIf(type === 'buttons')('matches the Vue player while playing', () => {
    const root = mountEmbed(type, 'center')
    goNext(root, type)
    root.querySelector<HTMLElement>('.bc-scene-player__play-btn')!.click()
    expect(normalize(root)).toBe(vueMarkup(type, 'center', 1, true))
  })
})
