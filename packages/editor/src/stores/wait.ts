/**
 * Global registry of named loading flags. Any component can ask whether a named
 * loader is active via `get(id)`; producers flip it with `set(id, value)`.
 * Ids are accepted as a plain string, a ref, or a getter (normalized here).
 */
export const useWaitStore = defineStore('wait', () => {
  const pending = reactive<Record<string, boolean>>({})

  function get(id: MaybeRefOrGetter<string>): boolean {
    return !!pending[toValue(id)]
  }

  function set(id: MaybeRefOrGetter<string>, value: boolean): boolean {
    pending[toValue(id)] = value
    return value
  }

  return { pending, get, set }
})
