<template>
  <BDropdownItemButton
    class="form-control-dropdown-item"
    :active="active"
    :button-class="'form-control-dropdown-item__button'"
    @click="$emit('select')"
  >
    <div class="form-control-dropdown-item__content">
      <component
        :is="icon"
        v-if="icon"
        class="form-control-dropdown-item__icon"
      />
      <div class="form-control-dropdown-item__text">
        <span
          class="form-control-dropdown-item__label"
          :class="labelClassList"
        >{{ label }}</span>
        <small
          v-if="description"
          class="form-control-dropdown-item__description"
          :class="descriptionClassList"
        >{{ description }}</small>
      </div>
      <div
        v-if="visual"
        class="form-control-dropdown-item__visual"
      >
        <component
          :is="visual"
          v-if="typeof visual !== 'string'"
          class="form-control-dropdown-item__visual-image bg-body rounded-1"
        />
        <img
          v-else
          :src="visual"
          alt=""
          class="form-control-dropdown-item__visual-image"
        >
      </div>
    </div>
  </BDropdownItemButton>
</template>

<script setup lang="ts">
import { type Component, computed } from 'vue'

const props = defineProps<{
  label: string
  description?: string
  visual?: string | Component
  icon?: Component
  active?: boolean
  lightLabel?: boolean
}>()

defineEmits<{
  select: []
}>()

const labelClassList = computed(() => ({
  'form-control-dropdown-item__label--bold': !props.lightLabel && props.label && props.description,
}))

const descriptionClassList = computed(() => ({
  'text-white-50': props.active,
  'text-secondary': !props.active,
}))
</script>

<style scoped>
.form-control-dropdown-item__content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.form-control-dropdown-item__icon {
  flex-shrink: 0;
  width: 1.25em;
  height: 1.25em;
}

.form-control-dropdown-item__visual {
  margin-left: auto;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.form-control-dropdown-item__visual-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-control-dropdown-item__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.form-control-dropdown-item__label--bold {
  font-weight: bold;
}

.form-control-dropdown-item__description {
  white-space: normal;
}
</style>
