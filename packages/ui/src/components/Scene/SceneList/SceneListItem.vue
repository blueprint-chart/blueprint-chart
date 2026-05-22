<script setup lang="ts">
import IPhX from '~icons/ph/x'

withDefaults(defineProps<{
  index: number
  name: string | null
  thumbnail: string | null
  hint: string | null
  active?: boolean
  removable?: boolean
}>(), {
  active: false,
  removable: true,
})

defineEmits<{
  select: []
  remove: []
}>()
</script>

<template>
  <li class="scene-list-item-row">
    <button
      type="button"
      class="scene-list-item"
      :class="{ 'scene-list-item--active': active }"
      :aria-current="active ? 'true' : undefined"
      @click="$emit('select')"
    >
      <span
        v-if="thumbnail"
        class="scene-list-item__thumb"
        v-html="thumbnail"
      />
      <span
        v-else
        class="scene-list-item__thumb scene-list-item__thumb--empty"
        aria-hidden="true"
      />
      <span class="scene-list-item__body">
        <span class="scene-list-item__label">SCENE {{ index }}</span>
        <span
          v-if="name"
          class="scene-list-item__name"
        >{{ name }}</span>
        <span
          v-if="hint"
          class="scene-list-item__hint"
        >{{ hint }}</span>
      </span>
    </button>
    <button
      v-if="removable"
      type="button"
      class="scene-list-item__remove"
      aria-label="Remove scene"
      @click.stop="$emit('remove')"
    >
      <IPhX />
    </button>
  </li>
</template>

<style scoped lang="scss">
.scene-list-item-row {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
  list-style: none;
}

.scene-list-item {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.625rem;
  min-height: 56px;
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-md);
  background: var(--bc-tile-bg);
  color: var(--bs-body-color);
  cursor: pointer;
  text-align: left;
  transition:
    border-color var(--bc-duration-base) var(--bc-ease),
    box-shadow var(--bc-duration-base) var(--bc-ease);

  &:hover {
    border-color: var(--bc-hairline-strong);
  }

  &--active {
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 1px var(--bs-primary);
  }

  &__thumb {
    width: 60px;
    height: 36px;
    flex-shrink: 0;
    border-radius: var(--bc-radius-sm);
    background: var(--bs-tertiary-bg);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(svg) {
      width: 100%;
      height: 100%;
      display: block;
    }

    &--empty {
      background: var(--bc-wash-soft);
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  &__label {
    font-family: var(--bs-font-monospace, "Geist Mono", ui-monospace, monospace);
    font-size: var(--bs-font-size-xs);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--bs-secondary-color);
    line-height: 1;
  }

  &__name {
    font-size: var(--bs-font-size-sm);
    font-weight: 500;
    color: var(--bs-body-color);
    line-height: 1.25;
    word-break: break-word;
  }

  &__hint {
    font-size: var(--bs-font-size-xs);
    color: var(--bs-secondary-color);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.scene-list-item__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  align-self: center;
  flex-shrink: 0;
  border: none;
  border-radius: var(--bc-radius-sm);
  background: transparent;
  color: var(--bs-secondary-color);
  cursor: pointer;
  transition:
    background-color var(--bc-duration-base) var(--bc-ease),
    color var(--bc-duration-base) var(--bc-ease);

  &:hover {
    background: var(--bc-wash-soft);
    color: var(--bs-danger, #dc3545);
  }
}
</style>
