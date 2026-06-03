import { useWaitStore } from '@/stores/wait'

/**
 * Named-loader helper backed by the global `wait` store. Modeled on ICIJ's
 * `useWait`, trimmed to named loaders only (no scoped/default-loader/throttle).
 */
export function useWait() {
  const store = useWaitStore()

  function waiting(id: MaybeRefOrGetter<string>): boolean {
    return store.get(id)
  }

  function start(id: MaybeRefOrGetter<string>): void {
    store.set(id, true)
  }

  function end(id: MaybeRefOrGetter<string>): void {
    store.set(id, false)
  }

  /**
   * Wrap an async task so its named loader is on for the duration of the call
   * and always cleared afterward. `waitFor(id, fn)` or `waitFor(fn)` (uses the
   * function's own .name, falling back to 'default').
   */
  function waitFor<T>(
    fnOrId: string | (() => T | Promise<T>),
    fn?: () => T | Promise<T>,
  ): () => Promise<T> {
    const task = typeof fnOrId === 'function' ? fnOrId : fn
    const id = typeof fnOrId === 'string' ? fnOrId : (fnOrId.name || 'default')
    if (typeof task !== 'function') {
      throw new Error('useWait.waitFor: expected a function to run')
    }
    return async (): Promise<T> => {
      start(id)
      try {
        return await task()
      }
      finally {
        end(id)
      }
    }
  }

  return { start, end, waiting, waitFor }
}
