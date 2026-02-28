<template>
  <BFormGroup
    class="form-control-direction-picker"
    :label="label"
  >
    <div class="form-control-direction-picker__grid">
      <button
        v-for="dir in directions"
        :key="dir"
        type="button"
        class="form-control-direction-picker__cell"
        :class="{ 'form-control-direction-picker__cell--active': modelValue === dir }"
        :title="dir"
        @click.stop.prevent="$emit('update:modelValue', dir)"
      >
        <span
          v-if="dir === 'center'"
          class="form-control-direction-picker__dot"
        />
      </button>
    </div>
  </BFormGroup>
</template>

<script setup lang="ts">
type CompassDirection = 'NW' | 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'center'

defineProps<{
  modelValue: CompassDirection
  label: string
}>()

defineEmits<{
  'update:modelValue': [value: CompassDirection]
}>()

const directions: CompassDirection[] = [
  'NW', 'N', 'NE',
  'W', 'center', 'E',
  'SW', 'S', 'SE',
]
</script>

<style scoped lang="scss">
.form-control-direction-picker__grid {
  display: grid;
  grid-template-columns: repeat(3, 20px);
  gap: 2px;
}

.form-control-direction-picker__cell {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid var(--bs-border-color);
  border-radius: 2px;
  background-color: var(--bs-tertiary-bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: var(--bs-secondary-bg);
  }

  &--active {
    background-color: var(--bs-primary);
    border-color: var(--bs-primary);
  }
}

.form-control-direction-picker__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--bs-body-color);

  .form-control-direction-picker__cell--active & {
    background-color: #fff;
  }
}
</style>
