<template>
  <BFormGroup
    class="direction-picker"
    :label="label"
  >
    <div
      class="direction-picker__anchor"
      :class="sizeClass"
    >
      <DirectionPickerField
        :x="activeDir.x"
        :y="activeDir.y"
      />
      <DirectionPickerHandle
        v-for="dir in directions"
        :key="dir.value"
        :pos="dir.pos"
        :label="dir.label"
        :shape="dir.shape"
        :active="model === dir.value"
        @select="model = dir.value"
      />
    </div>
  </BFormGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DirectionPickerField from './DirectionPickerField.vue'
import DirectionPickerHandle from './DirectionPickerHandle.vue'

type CompassDirection = 'NW' | 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'center'
type HandleShape = 'corner' | 'edge-h' | 'edge-v' | 'center'

export interface DirEntry {
  value: CompassDirection
  pos: string
  label: string
  shape: HandleShape
  x: number
  y: number
}

const model = defineModel<CompassDirection>({ required: true })

const props = withDefaults(
  defineProps<{
    label: string
    size?: 'xs' | 'sm' | 'md' | 'lg'
  }>(),
  { size: 'sm' },
)

const directions: DirEntry[] = [
  { value: 'NW', pos: 'nw', label: 'Top left', shape: 'corner', x: 0, y: 0 },
  { value: 'N', pos: 'n', label: 'Top', shape: 'edge-h', x: 0.5, y: 0 },
  { value: 'NE', pos: 'ne', label: 'Top right', shape: 'corner', x: 1, y: 0 },
  { value: 'W', pos: 'w', label: 'Left', shape: 'edge-v', x: 0, y: 0.5 },
  { value: 'center', pos: 'c', label: 'Center', shape: 'center', x: 0.5, y: 0.5 },
  { value: 'E', pos: 'e', label: 'Right', shape: 'edge-v', x: 1, y: 0.5 },
  { value: 'SW', pos: 'sw', label: 'Bottom left', shape: 'corner', x: 0, y: 1 },
  { value: 'S', pos: 's', label: 'Bottom', shape: 'edge-h', x: 0.5, y: 1 },
  { value: 'SE', pos: 'se', label: 'Bottom right', shape: 'corner', x: 1, y: 1 },
]

const activeDir = computed(() => directions.find(d => d.value === model.value) ?? directions[4])

const sizeClass = computed(() => `direction-picker__anchor--${props.size}`)
</script>

<style scoped lang="scss">
.direction-picker {
  &__anchor {
    position: relative;
    display: inline-block;

    // --- Size tokens (consumed by child components via CSS inheritance) ---
    &--xs {
      :deep(.direction-picker-field) { width: 72px; height: 48px; }
      --rect-w: 26px; --rect-h: 16px; --rect-pad: 6px; --rect-radius: 3px; --rect-border: 1.5px;
      --handle-circle: 8px; --handle-pill-long: 16px; --handle-pill-short: 8px;
    }

    &--sm {
      :deep(.direction-picker-field) { width: 100px; height: 68px; }
      --rect-w: 36px; --rect-h: 20px; --rect-pad: 6px; --rect-radius: 3px; --rect-border: 1.5px;
      --handle-circle: 9px; --handle-pill-long: 18px; --handle-pill-short: 9px;
    }

    &--md {
      :deep(.direction-picker-field) { width: 140px; height: 96px; }
      --rect-w: 48px; --rect-h: 24px; --rect-pad: 6px; --rect-radius: 4px; --rect-border: 2px;
      --handle-circle: 10px; --handle-pill-long: 22px; --handle-pill-short: 10px;
    }

    &--lg {
      :deep(.direction-picker-field) { width: 180px; height: 120px; }
      --rect-w: 60px; --rect-h: 30px; --rect-pad: 6px; --rect-radius: 4px; --rect-border: 2px;
      --handle-circle: 12px; --handle-pill-long: 26px; --handle-pill-short: 12px;
    }
  }
}
</style>
