<template>
  <BFormGroup
    class="form-control-palette"
    :label="label"
    :label-for="id"
  >
    <slot />
    <BDropdown
      ref="dropdownRef"
      class="form-control-palette__toggle"
      toggle-class="d-flex align-items-center"
      menu-class="w-100"
      variant="outline-secondary"
    >
      <template #button-content>
        <span class="form-control-palette__preview pe-1">
          <span class="form-control-palette__name flex-grow-1">
            {{ selectedPalette?.label ?? '' }}
          </span>
          <DisplayPalette
            v-if="selectedPalette"
            :colors="selectedPalette.colors"
            bordered
          />
        </span>
      </template>
      <BDropdownItemButton
        v-for="palette in resolvedPalettes"
        :key="palette.value"
        :active="model === palette.value"
        @click="selectPalette(palette.value)"
      >
        <span class="form-control-palette__item">
          <span class="flex-grow-1">{{ palette.label }}</span>
          <DisplayPalette
            :colors="palette.colors"
            bordered
          />
        </span>
      </BDropdownItemButton>
    </BDropdown>
  </BFormGroup>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import DisplayPalette from '../../Display/DisplayPalette/DisplayPalette.vue'
import { useChildEntriesProvider } from '../../../composables/useChildEntries'
import { PaletteEntriesKey } from '../../../composables/injection-keys'

const model = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{
  label?: string
  id?: string
  palettes?: { value: string, label: string, colors: string[] }[]
}>(), {
  palettes: () => [],
})

const { entries } = useChildEntriesProvider(PaletteEntriesKey)
const resolvedPalettes = computed(() =>
  entries.value.length > 0 ? entries.value : props.palettes,
)

const dropdownRef = useTemplateRef<{ hide: () => void }>('dropdownRef')

const selectedPalette = computed(() =>
  resolvedPalettes.value.find(p => p.value === model.value),
)

function selectPalette(value: string) {
  model.value = value
  dropdownRef.value?.hide()
}
</script>

<style scoped lang="scss">
.form-control-palette__toggle {
  width: 100%;

  :deep(.dropdown-toggle) {
    width: 100%;
    text-align: left;
    overflow: hidden;
  }
}

.form-control-palette__preview {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  flex: 1;
  min-width: 0;
}

.form-control-palette__name {
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.form-control-palette__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
