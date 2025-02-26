import { type InjectionKey, type Ref, getCurrentInstance, inject, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'

export interface ChildEntriesContext<T> {
  register(uid: number, data: T): void
  update(uid: number, data: T): void
  unregister(uid: number): void
}

export function useChildEntriesProvider<T>(key: InjectionKey<ChildEntriesContext<T>>) {
  const map = new Map<number, T>()
  const entries = ref<T[]>([]) as Ref<T[]>

  function sync() {
    entries.value = Array.from(map.values())
  }

  const context: ChildEntriesContext<T> = {
    register(uid, data) {
      map.set(uid, data)
      sync()
    },
    update(uid, data) {
      map.set(uid, data)
      sync()
    },
    unregister(uid) {
      map.delete(uid)
      sync()
    },
  }

  provide(key, context)

  return { entries }
}

export function useChildEntry<T>(key: InjectionKey<ChildEntriesContext<T>>, getData: () => T) {
  const context = inject(key, null)
  if (!context) return

  const instance = getCurrentInstance()
  if (!instance) return

  const uid = instance.uid

  onMounted(() => {
    context.register(uid, getData())
  })

  watch(getData, (data) => {
    context.update(uid, data)
  })

  onBeforeUnmount(() => {
    context.unregister(uid)
  })
}
