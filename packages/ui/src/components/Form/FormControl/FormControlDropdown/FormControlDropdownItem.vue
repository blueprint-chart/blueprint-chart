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
        class="form-control-dropdown-item__content__icon"
      />
      <div class="form-control-dropdown-item__content__text">
        <span
          class="form-control-dropdown-item__content__text__label"
          :class="labelClassList"
        >{{ label }}</span>
        <small
          v-if="description"
          class="form-control-dropdown-item__content__text__description"
          :class="descriptionClassList"
        >{{ description }}</small>
      </div>
      <div
        v-if="visual"
        class="form-control-dropdown-item__content__visual"
      >
        <component
          :is="visual"
          v-if="typeof visual !== 'string'"
          class="form-control-dropdown-item__content__visual__image bg-body rounded-1"
        />
        <img
          v-else
          :src="visual"
          alt=""
          class="form-control-dropdown-item__content__visual__image"
        >
      </div>
    </div>
  </BDropdownItemButton>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

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
  'form-control-dropdown-item__content__text__label--bold': !props.lightLabel && props.label && props.description,
}))

const descriptionClassList = computed(() => ({
  'text-white-50': props.active,
  'text-secondary': !props.active,
}))
</script>

<style scoped lang="scss">
.form-control-dropdown-item {
  &__content {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;

    &__icon {
      flex-shrink: 0;
      width: 1.25em;
      height: 1.25em;
    }

    &__visual {
      margin-left: auto;
      width: 40px;
      height: 40px;
      flex-shrink: 0;

      &__image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    &__text {
      display: flex;
      flex-direction: column;
      min-width: 0;

      &__label--bold {
        font-weight: bold;
      }

      &__description {
        white-space: normal;
      }
    }
  }
}
</style>
