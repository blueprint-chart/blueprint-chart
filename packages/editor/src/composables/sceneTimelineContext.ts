import type { InjectionKey, Ref } from 'vue'

export interface SceneTimelineScene {
  name: string | null
  index: number
  thumbnail?: string | null
  removable?: boolean
  hint?: string
}

// Shared context published by WizardShell (which owns the scene/timeline state
// and handlers) and consumed by FloatingSceneTimeline, which renders the
// floating timeline inside whichever step canvas is currently mounted. Using
// provide/inject keeps the timeline logic in one place without a <Teleport>:
// the timeline renders directly in the canvas, so there is no cross-tree
// teleport target to resolve.
export interface SceneTimelineContext {
  scenes: Ref<SceneTimelineScene[]>
  activeIndex: Ref<number>
  playing: Ref<boolean>
  showTimeline: Ref<boolean>
  onSelect: (timelineIndex: number) => void
  onAdd: () => void
  onRemove: (timelineIndex: number) => void
  onPlay: () => void
  onPause: () => void
}

export const sceneTimelineKey: InjectionKey<SceneTimelineContext> = Symbol('sceneTimeline')
