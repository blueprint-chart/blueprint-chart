<template>
  <button
    class="scene-timeline-item"
    :class="{ 'scene-timeline-item--active': active }"
    type="button"
    @click="$emit('select')"
  >
    <span
      v-if="removable"
      class="scene-timeline-item__remove"
      role="button"
      aria-label="Remove scene"
      @click.stop="$emit('remove')"
    >
      &times;
    </span>
    <span class="scene-timeline-item__label">Scene {{ index + 1 }}</span>
    <span
      class="scene-timeline-item__preview"
      v-html="thumbnail"
    />
    <span
      v-if="name"
      class="scene-timeline-item__name"
    >{{ name }}</span>
  </button>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
  min-width: 120px;
  border: 2px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius-lg);
  padding: 0.375rem 0.5rem;
  cursor: pointer;
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  flex-shrink: 0;
  gap: 0.125rem;

  &:hover {
    border-color: var(--bs-primary);

    .scene-timeline-item__remove {
      opacity: 1;
    }
  }

  &--active {
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 1px var(--bs-primary);
  }
}

.scene-timeline-item__remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bs-danger, #dc3545);
  color: #fff;
  font-size: 0.6875rem;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.15s ease;
  cursor: pointer;
  z-index: 1;
}

.scene-timeline-item__label {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--bs-secondary-color);
  line-height: 1;
}

.scene-timeline-item__preview {
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

.scene-timeline-item__name {
  font-size: 0.6875rem;
  color: var(--bs-body-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1.2;
}
</style>
