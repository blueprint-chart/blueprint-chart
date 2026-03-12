<template>
  <div class="list-series-row">
    <ColorSwatch :color="color" />
    <span class="list-series-row__name">{{ name }}</span>
    <BFormCheckbox
      switch
      :model-value="model"
      class="list-series-row__toggle"
      @update:model-value="model = $event as boolean"
    />
  </div>
</template>

<script setup lang="ts">
import ColorSwatch from '../../Display/DisplayColorSwatch/DisplayColorSwatch.vue'

const model = defineModel<boolean>({ required: true })

defineProps<{
  color: string
  name: string
}>()
</script>

<style scoped lang="scss">
.list-series-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;

  &__name {
    flex: 1;
    font-size: 0.8125rem;
    color: var(--bs-body-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
