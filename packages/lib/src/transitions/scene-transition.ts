import * as d3 from 'd3'
import { BC_TRANSITION_NAME, type SceneTransitionState } from './types'

const DEFAULT_DURATION_MS = 500

const registry = new WeakMap<HTMLElement, SceneTransition>()

/** Get or create the SceneTransition bound to this container. */
export function getSceneTransition(container: HTMLElement): SceneTransition {
  let t = registry.get(container)
  if (!t) {
    t = new SceneTransition(container)
    registry.set(container, t)
  }
  return t
}

/** Drop the registry entry for `container` (e.g. on chart destroy). */
function dropFromRegistry(container: HTMLElement): void {
  registry.delete(container)
}

export interface CommitOptions {
  /** Tween duration in ms. `0` snaps without animating (reduced-motion path). */
  duration?: number
}

/**
 * Per-container orchestrator that owns the scene transition lifecycle.
 *
 * Lifecycle:
 *   idle ──beginCommit()──▶ committing ──commit()──▶ animating ──end──▶ idle
 *
 * Re-entry into `beginCommit()` while in `committing` or `animating`
 * interrupts the prior transition (invariant I1) before proceeding.
 *
 * NOTE: this task implements only the lifecycle / interrupt / registry.
 * `featureJoin` and feature buffering arrive in the next task.
 */
export class SceneTransition {
  readonly container: HTMLElement
  private _state: SceneTransitionState = 'idle'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _transition: any = null
  private _buffer: Array<() => void> = []

  /**
   * Internal: register a flush callback to be run on the next commit.
   * Used by `featureJoin` to defer DOM mutations until the orchestrator
   * is animating. Callbacks run in registration order.
   */
  register(flush: () => void): void {
    this._buffer.push(flush)
  }

  constructor(container: HTMLElement) {
    this.container = container
  }

  get state(): SceneTransitionState {
    return this._state
  }

  /** Internal: the active d3 transition handle, or null when not animating. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get activeTransition(): any {
    return this._transition
  }

  /**
   * Enter the committing phase. If a prior transition is in flight, it
   * is interrupted first (invariant I1).
   */
  beginCommit(): void {
    if (this._state === 'committing' || this._state === 'animating') {
      this.interrupt()
    }
    this._state = 'committing'
  }

  /**
   * Commit any buffered work and start animating.
   *
   * If `duration` is 0 (e.g. prefers-reduced-motion), the orchestrator
   * goes straight to idle without creating a d3 transition. Tests that
   * pass `duration: 0` rely on this snap path.
   */
  commit(opts: CommitOptions = {}): void {
    if (this._state !== 'committing') {
      console.warn(`[blueprint-chart] commit() called from state '${this._state}' — call beginCommit() first; ignored.`)
      return
    }
    const requested = opts.duration ?? DEFAULT_DURATION_MS
    const duration = this.effectiveDuration(requested)
    const buffered = this._buffer
    this._buffer = []
    if (duration <= 0) {
      // Snap path: run each flush with no transition handle, then idle.
      this._state = 'animating'
      for (const flush of buffered) {
        try { flush() }
        catch (err) { console.warn('[blueprint-chart] feature flush failed:', err) }
      }
      this._state = 'idle'
      return
    }
    this._state = 'animating'
    const t = d3.transition(BC_TRANSITION_NAME).duration(duration).ease(d3.easeCubicInOut)
    this._transition = t
    for (const flush of buffered) {
      try { flush() }
      catch (err) { console.warn('[blueprint-chart] feature flush failed:', err) }
    }
    t.on('end', () => {
      if (this._transition === t) {
        this._transition = null
        this._state = 'idle'
      }
    })
    t.on('interrupt', () => {
      if (this._transition === t) {
        this._transition = null
        this._state = 'idle'
      }
    })
  }

  /**
   * Clamp a requested duration to 0 when the user prefers reduced motion.
   * The lifecycle still runs (snap path), so the same code paths exercise
   * both animated and reduced-motion behaviour — no aesthetic-only branch.
   */
  private effectiveDuration(requested: number): number {
    if (requested <= 0) { return 0 }
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return requested
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : requested
  }

  /**
   * Cancel any in-flight tween. Always safe; idempotent on `idle`.
   *
   * NOTE: this interrupts BC_TRANSITION_NAME tweens on the container and
   * its attached descendants. A descendant that was detached from the
   * container (e.g. an exit node that already self-removed) cannot be
   * reached and its tween may continue ticking until natural completion.
   * Task 5 (featureJoin exit pathway) must therefore wait for the
   * transition's `end` event before calling `.remove()`, not before.
   */
  interrupt(): void {
    this._buffer = []
    this._transition = null
    // Cancel every BC_TRANSITION_NAME tween on any descendant of the
    // container. Element-bound transitions inherit the name from the
    // standalone `d3.transition(BC_TRANSITION_NAME)` we created in commit().
    d3.select(this.container).interrupt(BC_TRANSITION_NAME)
    d3.select(this.container).selectAll('*').interrupt(BC_TRANSITION_NAME)
    this._state = 'idle'
  }

  /**
   * Convenience: run a synchronous callback inside `committing` and then
   * commit. Catches exceptions from the callback so the lifecycle never
   * gets stuck.
   */
  run(work: () => void, opts: CommitOptions = {}): void {
    this.beginCommit()
    try {
      work()
    }
    catch (err) {
      console.warn('[blueprint-chart] scene-transition commit failed:', err)
      this._state = 'idle'
      return
    }
    this.commit(opts)
  }

  /**
   * Tear down: interrupt and drop the WeakMap entry so a fresh lookup
   * returns a new instance. Idempotent.
   */
  destroy(): void {
    this.interrupt()
    dropFromRegistry(this.container)
  }
}
