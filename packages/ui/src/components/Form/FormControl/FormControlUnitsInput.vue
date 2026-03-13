<template>
  <BFormGroup
    class="form-control-units-input"
    :label="label"
    :label-for="id"
  >
    <div class="form-control-units-input__row">
      <BFormInput
        v-if="!noSlider"
        :id="id"
        type="range"
        :model-value="numericPart"
        :min="min"
        :max="sliderMax"
        :step="step"
        class="form-control-units-input__row__range"
        @update:model-value="onNumericChange"
      />
      <div class="form-control-units-input__row__group">
        <BFormInput
          :model-value="numericPart"
          class="form-control-units-input__row__group__number"
          size="sm"
          @update:model-value="onNumericChange"
        />
        <BDropdown
          class="form-control-units-input__row__group__dropdown"
          :text="unitPart"
          size="sm"
          variant="outline-secondary"
          end
        >
          <BDropdownItem
            v-for="u in units"
            :key="u"
            :active="u === unitPart"
            @click="onUnitSelect(u)"
          >
            {{ u }}
          </BDropdownItem>
        </BDropdown>
      </div>
    </div>
  </BFormGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const model = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{
  label: string
  id: string
  units: string[]
  min?: string
  max?: string
  step?: string
  noSlider?: boolean
  centerRelative?: boolean
}>(), {
  min: '0',
  max: '100',
  step: '1',
  noSlider: false,
  centerRelative: false,
})

function parseValue(value: string): { num: string, unit: string } {
  const match = value.match(/^(-?\d*\.?\d+)\s*(%|[a-z]+)?$/i)
  if (match) {
    return { num: match[1], unit: match[2] || props.units[0] }
  }
  return { num: '0', unit: props.units[0] }
}

const numericPart = computed(() => parseValue(model.value).num)
const unitPart = computed(() => parseValue(model.value).unit)

const sliderMax = computed(() => unitPart.value === '%' ? '100' : props.max)

function onNumericChange(v: string | number | null) {
  model.value = `${String(v ?? '')}${unitPart.value}`
}

function onUnitSelect(newUnit: string) {
  const oldUnit = unitPart.value
  const oldNum = parseFloat(numericPart.value)
  const ref = parseFloat(props.max)

  let converted = oldNum
  if (oldUnit !== newUnit && ref > 0) {
    if (props.centerRelative) {
      // Center-relative: 0% = center (ref/2 px), -50% = 0px, 50% = ref px
      if (oldUnit === 'px' && newUnit === '%') {
        converted = +((oldNum / ref - 0.5) * 100).toFixed(1)
      }
      else if (oldUnit === '%' && newUnit === 'px') {
        converted = Math.round((oldNum / 100 + 0.5) * ref)
      }
    }
    else {
      if (oldUnit === 'px' && newUnit === '%') {
        converted = Math.round((oldNum / ref) * 100)
      }
      else if (oldUnit === '%' && newUnit === 'px') {
        converted = Math.round((oldNum / 100) * ref)
      }
    }
  }

  model.value = `${converted}${newUnit}`
}
</script>

<style scoped lang="scss">
.form-control-units-input {
  &__row {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &__range {
      flex-grow: 1;
    }

    &__group {
      display: flex;
      flex-grow: 1;

      &__number {
        width: 4em;
        flex-grow: 1;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      &__dropdown {
        :deep(.dropdown-toggle) {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          border-left: 0;
          height: 100%;
          border-color: var(--bs-border-color);
        }

        :deep(.dropdown-menu) {
          --bs-dropdown-min-width: 0;
        }
      }
    }
  }
}
</style>
