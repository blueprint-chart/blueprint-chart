<script setup lang="ts">
import { ButtonIcon, FormControlColorsInput } from '@blueprint-chart/ui'
import IPhCheck from '~icons/ph/check'
import IPhTrash from '~icons/ph/trash'

const model = defineModel<{ label: string, colors: string[] }>({ required: true })

defineEmits<{
  remove: []
  done: []
}>()

const id = useId()
const confirming = shallowRef(false)

const label = computed({
  get: () => model.value.label,
  set: value => model.value = { ...model.value, label: value },
})

const colors = computed({
  get: () => model.value.colors,
  set: value => model.value = { ...model.value, colors: value },
})
</script>

<template>
  <BCard class="palettes-card-editor">
    <BFormGroup
      class="palettes-card-editor__label"
      label="Name"
      :label-for="`${id}-label`"
    >
      <BFormInput
        :id="`${id}-label`"
        v-model="label"
      />
    </BFormGroup>
    <FormControlColorsInput
      :id="`${id}-colors`"
      v-model="colors"
      class="palettes-card-editor__colors"
      label="Colors"
    />
    <div class="palettes-card-editor__actions">
      <ButtonIcon
        label="Done"
        :icon-left="IPhCheck"
        variant="primary"
        size="sm"
        @click="$emit('done')"
      />
      <ButtonIcon
        label="Delete"
        :icon-left="IPhTrash"
        variant="outline-danger"
        size="sm"
        @click="confirming = true"
      />
    </div>
    <BModal
      v-model="confirming"
      title="Delete palette"
      ok-title="Delete"
      ok-variant="danger"
      @ok="$emit('remove')"
    >
      Delete "{{ model.label }}"? Charts that use its colors keep them.
    </BModal>
  </BCard>
</template>

<style scoped lang="scss">
.palettes-card-editor {
  &__actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
}
</style>
