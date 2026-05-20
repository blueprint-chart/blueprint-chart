<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEventListener } from '@vueuse/core'

export interface NavigationSectionDropdownSection {
  text: string
  link: string
}

const props = withDefaults(defineProps<{
  sections: ReadonlyArray<NavigationSectionDropdownSection>
  activeLink?: string
  triggerLabel?: string
}>(), {
  activeLink: undefined,
  triggerLabel: 'Switch section',
})

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)

const activeText = computed(() => {
  const found = props.sections.find(section => section.link === props.activeLink)
  return found?.text ?? props.triggerLabel
})

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

// Document-level Escape handler — needed because the panel `<menu>` is
// not focusable; if the user opens via click (focus on the trigger) and
// presses Escape, the keydown would never reach the panel itself.
useEventListener(document, 'keydown', (event: KeyboardEvent) => {
  if (!open.value) {
    return
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    open.value = false
    triggerRef.value?.focus()
  }
})

// Outside-click handler — `mousedown` (not `click`) so the panel closes
// before any link inside it activates a navigation.
useEventListener(document, 'mousedown', (event: MouseEvent) => {
  if (!open.value) {
    return
  }
  const target = event.target as HTMLElement | null
  if (target && root.value && !root.value.contains(target)) {
    close()
  }
})
</script>

<template>
  <div
    ref="root"
    class="navigation-section-dropdown"
  >
    <button
      ref="triggerRef"
      type="button"
      class="navigation-section-dropdown__trigger"
      :aria-expanded="open ? 'true' : 'false'"
      aria-haspopup="menu"
      @click="toggle"
    >
      <span class="navigation-section-dropdown__label">{{ activeText }}</span>
      <span
        class="navigation-section-dropdown__caret"
        aria-hidden="true"
      >▾</span>
    </button>

    <menu
      v-if="open"
      class="navigation-section-dropdown__panel"
      role="menu"
    >
      <a
        v-for="s in sections"
        :key="s.link"
        :href="s.link"
        role="menuitem"
        class="navigation-section-dropdown__item"
        :class="{ 'navigation-section-dropdown__item--active': s.link === activeLink }"
        :aria-current="s.link === activeLink ? 'page' : undefined"
      >{{ s.text }}</a>
    </menu>
  </div>
</template>

<style scoped lang="scss">
.navigation-section-dropdown {
  position: relative;
  display: block;
}

.navigation-section-dropdown__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  padding: 0.375rem 0.75rem;
  background: var(--bc-wash-soft);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-xs);
  color: var(--bs-body-color);
  font-family: inherit;
  font-size: var(--bs-font-size-sm);
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background var(--bc-duration-base) var(--bc-ease),
              border-color var(--bc-duration-base) var(--bc-ease);

  &:hover {
    background: var(--bc-wash-firm, var(--bc-wash-soft));
    border-color: var(--bc-hairline-strong, var(--bc-hairline));
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--bc-focus-ring);
  }
}

.navigation-section-dropdown__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navigation-section-dropdown__caret {
  opacity: 0.6;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.navigation-section-dropdown__panel {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  right: 0;
  margin: 0;
  padding: 0.25rem;
  list-style: none;
  background: var(--bc-tile-bg);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-sm);
  box-shadow: var(--bc-shadow-overlay);
  z-index: 50;
}

.navigation-section-dropdown__item {
  display: block;
  padding: 0.375rem 0.5rem;
  border-radius: var(--bc-radius-xs);
  color: var(--bs-body-color);
  font-size: var(--bs-font-size-sm);
  text-decoration: none;
  transition: background var(--bc-duration-base) var(--bc-ease);

  &:hover {
    background: var(--bc-wash-soft);
    text-decoration: none;
  }

  &:focus-visible {
    outline: none;
    background: var(--bc-wash-soft);
    box-shadow: var(--bc-focus-ring);
  }

  &--active {
    background: var(--bc-tile-bg-elevated);
    font-weight: 600;
  }
}
</style>
