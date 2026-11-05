<template>
  <div
    class="scene-timeline-item"
    :class="{ 'scene-timeline-item--active': active }"
  >
    <button
      class="scene-timeline-item__select"
      type="button"
      @click="$emit('select')"
    >
      <span class="scene-timeline-item__select__label">Scene {{ index + 1 }}</span>
      <span
        class="scene-timeline-item__select__preview"
        v-html="thumbnail"
      />
      <span
        v-if="name"
        class="scene-timeline-item__select__name"
      >{{ name }}</span>
    </button>
    <button
      v-if="removable"
      class="scene-timeline-item__remove"
      type="button"
      :aria-label="`Remove scene ${index + 1}`"
      @click="$emit('remove')"
    >
      &times;
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  name: string | null
  index: number
  active?: boolean
  thumbnail?: string | null
  removable?: boolean
}>(), {
  active: false,
  thumbnail: null,
  removable: true,
})

defineEmits<{
  select: []
  remove: []
}>()
</script>

<style scoped lang="scss">
.scene-timeline-item {
  position: relative;
  flex-shrink: 0;
  width: 120px;
  min-width: 120px;

  &:hover,
  &:focus-within {
    .scene-timeline-item__remove {
      opacity: 1;
    }
  }

  &__select {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    border: 1px solid var(--bc-hairline);
    border-radius: var(--bc-radius-md);
    padding: 0.375rem 0.5rem;
    cursor: pointer;
    background: var(--bc-tile-bg);
    color: var(--bs-body-color);
    transition: border-color var(--bc-duration-base) var(--bc-ease),
                box-shadow var(--bc-duration-base) var(--bc-ease);
    gap: 0.125rem;

    &:hover {
      border-color: var(--bc-hairline-strong);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--bc-focus-ring);
    }

    .scene-timeline-item--active & {
      border-color: var(--bs-emphasis-color);
      box-shadow: var(--bc-selected-ring);
    }

    .scene-timeline-item--active &:focus-visible {
      box-shadow: var(--bc-focus-ring), var(--bc-selected-ring);
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

    &__preview {
      width: 100%;
      height: 48px;
      border-radius: var(--bs-border-radius-sm);
      background: var(--bs-tertiary-bg);
      overflow: hidden;

      :deep(svg) {
        width: 100%;
        height: 100%;
        display: block;
      }
    }

    &__name {
      font-size: var(--bs-font-size-xs);
      color: var(--bs-body-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      line-height: 1.2;
    }
  }

  &__remove {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: var(--bs-danger, #dc3545);
    color: #fff;
    font-size: var(--bs-font-size-xs);
    line-height: 1;
    opacity: 0;
    transition: opacity 0.15s ease;
    cursor: pointer;
    z-index: 1;

    &:focus-visible {
      opacity: 1;
      outline: none;
      box-shadow: var(--bc-focus-ring);
    }
  }
}
</style>
