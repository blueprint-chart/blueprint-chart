import { prefersReducedMotion } from '../charts/motion'
import { createPlayback, onceVisible } from './playback'
import type { PlaybackSettings } from './playback'

export type PlayerType = 'buttons' | 'progress-bar' | 'dot-stepper' | 'minimal-arrows'
export type PlayerPosition = 'left' | 'center' | 'right'

export interface PlayerState {
  current: number
  total: number
  playing: boolean
  position: PlayerPosition
}

export interface PlayerConfig extends PlaybackSettings {
  type: PlayerType | 'none'
  position: PlayerPosition
  total: number
}

const STEP_SELECTOR = '.bc-scene-player__dots__dot, .bc-scene-player__segments__segment'

const BACK_ICON = '<svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 1.5L1.5 6l4 4.5" /></svg>'
const FORWARD_ICON = '<svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 1.5L6.5 6l-4 4.5" /></svg>'
const PREVIOUS_ARROW = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 2L3.5 5l3 3" /></svg>'
const NEXT_ARROW = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 2L6.5 5l-3 3" /></svg>'

function playIcon(size: number, playing: boolean): string {
  const shape = playing
    ? '<rect x="1.5" y="1" width="3" height="10" rx="0.8" /><rect x="7.5" y="1" width="3" height="10" rx="0.8" />'
    : '<path d="M2.5 1v10l8-5z" />'
  return `<svg width="${size}" height="${size}" viewBox="0 0 12 12" fill="currentColor">${shape}</svg>`
}

function disabledAttribute(isDisabled: boolean): string {
  return isDisabled ? ' disabled' : ''
}

function playButton(size: number, playing: boolean): string {
  const label = playing ? 'Pause' : 'Play'
  return `<button type="button" class="bc-scene-player__play-btn" aria-label="${label}">${playIcon(size, playing)}</button>`
}

function navButton(action: 'previous' | 'next', label: string, icon: string, isDisabled: boolean): string {
  return `<button type="button" class="bc-scene-player__nav-btn"${disabledAttribute(isDisabled)} aria-label="${label}" data-action="${action}">${icon}</button>`
}

function stepButtons(block: string, { current, total }: PlayerState): string {
  const buttons = []
  for (let i = 1; i <= total; i++) {
    const active = i === current ? ` ${block}--active` : ''
    const completed = i < current ? ` ${block}--completed` : ''
    const ariaCurrent = i === current ? ' aria-current="step"' : ''
    buttons.push(`<button type="button" class="${block}${active}${completed}" aria-label="Scene ${i} of ${total}"${ariaCurrent}></button>`)
  }
  return buttons.join('')
}

function buttonsHtml(state: PlayerState): string {
  const isFirst = state.current <= 1
  const isLast = state.current >= state.total
  const previousClass = isFirst ? ' bc-scene-player__btn-group__btn--disabled' : ''
  const nextClass = isLast ? ' bc-scene-player__btn-group__btn--disabled' : ''
  return `<div class="bc-scene-player bc-scene-player--buttons bc-scene-player--${state.position}" data-scene-player>`
    + '<div class="bc-scene-player__btn-group">'
    + `<button type="button" class="bc-scene-player__btn-group__btn${previousClass}"${disabledAttribute(isFirst)} aria-label="Previous scene" data-action="previous">${BACK_ICON} Back</button>`
    + `<button type="button" class="bc-scene-player__btn-group__btn bc-scene-player__btn-group__btn--next${nextClass}"${disabledAttribute(isLast)} aria-label="Next scene" data-action="next">Next ${FORWARD_ICON}</button>`
    + '</div>'
    + `<span class="bc-scene-player__counter">${state.current} / ${state.total}</span>`
    + '</div>'
}

function dotStepperHtml(state: PlayerState): string {
  return `<div class="bc-scene-player bc-scene-player--dot-stepper bc-scene-player--${state.position}" data-scene-player>`
    + navButton('previous', 'Previous scene', PREVIOUS_ARROW, state.current <= 1)
    + playButton(11, state.playing)
    + `<div class="bc-scene-player__dots">${stepButtons('bc-scene-player__dots__dot', state)}</div>`
    + navButton('next', 'Next scene', NEXT_ARROW, state.current >= state.total)
    + '</div>'
}

function minimalArrowsHtml(state: PlayerState): string {
  return `<div class="bc-scene-player bc-scene-player--minimal-arrows bc-scene-player--${state.position}" data-scene-player>`
    + `<span class="bc-scene-player__counter">${state.current}/${state.total}</span>`
    + navButton('previous', 'Previous scene', PREVIOUS_ARROW, state.current <= 1)
    + playButton(9, state.playing)
    + navButton('next', 'Next scene', NEXT_ARROW, state.current >= state.total)
    + '</div>'
}

function progressBarHtml(state: PlayerState): string {
  return '<div class="bc-scene-player bc-scene-player--progress-bar" data-scene-player>'
    + playButton(10, state.playing)
    + `<div class="bc-scene-player__segments">${stepButtons('bc-scene-player__segments__segment', state)}</div>`
    + `<span class="bc-scene-player__counter">${state.current}/${state.total}</span>`
    + '</div>'
}

const PLAYER_HTML: Record<PlayerType, (state: PlayerState) => string> = {
  'buttons': buttonsHtml,
  'dot-stepper': dotStepperHtml,
  'minimal-arrows': minimalArrowsHtml,
  'progress-bar': progressBarHtml,
}

export function scenePlayerHtml(type: PlayerType, state: PlayerState): string {
  return PLAYER_HTML[type](state)
}

function htmlToElement(html: string): Element {
  const template = document.createElement('template')
  template.innerHTML = html
  return template.content.firstElementChild as Element
}

function syncAttributes(target: Element, source: Element): void {
  for (const { name } of Array.from(target.attributes)) {
    if (!source.hasAttribute(name)) {
      target.removeAttribute(name)
    }
  }
  for (const { name, value } of Array.from(source.attributes)) {
    if (target.getAttribute(name) !== value) {
      target.setAttribute(name, value)
    }
  }
}

function haveSameShape(target: Element, source: Element): boolean {
  const targetChildren = target.childNodes
  const sourceChildren = source.childNodes
  if (targetChildren.length !== sourceChildren.length) {
    return false
  }
  return Array.from(targetChildren).every((child, i) => child.nodeName === sourceChildren[i].nodeName)
}

// Patching in place (instead of rebuilding) keeps keyboard focus on the
// clicked button and lets the dot / segment CSS transitions run, as Vue does.
function patchElement(target: Element, source: Element): void {
  syncAttributes(target, source)
  if (!haveSameShape(target, source)) {
    target.replaceChildren(...Array.from(source.childNodes))
    return
  }
  target.childNodes.forEach((child, i) => {
    const sourceChild = source.childNodes[i]
    if (child instanceof Element) {
      patchElement(child, sourceChild as Element)
    }
    else if (child.nodeValue !== sourceChild.nodeValue) {
      child.nodeValue = sourceChild.nodeValue
    }
  })
}

export function mountScenePlayer(chart: HTMLElement, config: PlayerConfig, onStep: (step: number) => void): void {
  const state: PlayerState = { current: 1, total: config.total, playing: false, position: config.position }
  const playerType = config.type === 'none' ? null : config.type
  const root = htmlToElement(scenePlayerHtml(playerType ?? 'buttons', state))

  function render(): void {
    if (!playerType) {
      return
    }
    const fresh = htmlToElement(scenePlayerHtml(playerType, state))
    patchElement(root, fresh)
  }

  function go(step: number): void {
    if (step < 1 || step > state.total || step === state.current) {
      return
    }
    const focusedControl = findFocusedControl()
    state.current = step
    // onStep re-renders the chart, which rebuilds the frame and detaches the
    // player: re-attach before patching so focus and transitions survive.
    onStep(step)
    attachToFooter()
    render()
    restoreFocus(focusedControl)
  }

  const settings: PlaybackSettings = { ...config, loop: config.loop && playerType !== null }
  const playback = createPlayback({
    total: () => state.total,
    current: () => state.current,
    go,
    settings: () => settings,
    onChange: (playing) => {
      state.playing = playing
      render()
    },
  })

  // A step can disable the focused button (Next on the last scene), and
  // focus() on a disabled button drops focus to <body>.
  function restoreFocus(control: HTMLElement | null): void {
    if (!control) {
      return
    }
    const fallback = root.querySelector<HTMLElement>('button:not(:disabled)')
    const target = control.matches(':disabled') ? fallback : control
    target?.focus()
  }

  function findFocusedControl(): HTMLElement | null {
    const active = document.activeElement
    if (active instanceof HTMLElement && root.contains(active)) {
      return active
    }
    return null
  }

  function togglePlayback(): void {
    if (state.playing) {
      playback.stop()
    }
    else {
      playback.play()
    }
  }

  function stepOf(button: Element): number {
    const siblings = Array.from(button.parentElement?.children ?? [])
    return siblings.indexOf(button) + 1
  }

  function onClick(event: Event): void {
    stopAutoplayWatch()
    const button = (event.target as Element).closest('button')
    if (!button) {
      return
    }
    const action = button.dataset.action
    if (button.classList.contains('bc-scene-player__play-btn')) {
      togglePlayback()
    }
    else if (action === 'previous') {
      playback.stop()
      go(state.current - 1)
    }
    else if (action === 'next') {
      playback.stop()
      go(state.current + 1)
    }
    else if (button.matches(STEP_SELECTOR)) {
      playback.stop()
      go(stepOf(button))
    }
  }

  // A scene re-render rebuilds the chart frame, footer included, so the
  // player follows the footer around as PreviewChart.vue does in the editor.
  function attachToFooter(): void {
    const footer = chart.querySelector('.bc-frame-footer')
    if (footer && root.parentElement !== footer) {
      footer.appendChild(root)
    }
  }

  let stopAutoplayWatch = () => {}
  const autoplays = config.autoplay && !prefersReducedMotion()
  if (autoplays) {
    stopAutoplayWatch = onceVisible(chart, playback.play)
  }
  if (!playerType) {
    return
  }
  root.addEventListener('click', onClick)
  attachToFooter()
  new MutationObserver(attachToFooter).observe(chart, { childList: true })
}
