<script setup lang="ts">
import { ButtonIcon, DisplayContrastBadge, DisplayPalette } from '@blueprint-chart/ui'
import { useColorAccessibility } from '@/components/Editor/useColorAccessibility'
import IPhCopy from '~icons/ph/copy'
import IPhPencilSimple from '~icons/ph/pencil-simple'
import IPhTrash from '~icons/ph/trash'

const props = defineProps<{
  label: string
  colors: string[]
  editable: boolean
}>()

defineEmits<{
  duplicate: []
  edit: []
  remove: []
}>()

const { lightContrastInfo, darkContrastInfo, cvdInfo } = useColorAccessibility(() => props.colors, false, true)
const cvdIssueLabels = computed(() => cvdInfo.value?.issues.map(issue => issue.shortLabel).join(', '))
</script>

<template>
  <BCard class="palettes-card">
    <h3 class="palettes-card__title h6">
      {{ label }}
    </h3>
    <DisplayPalette
      class="palettes-card__swatches"
      :colors="colors"
    />
    <div class="palettes-card__badges">
      <DisplayContrastBadge
        v-if="lightContrastInfo"
        class="palettes-card__badges__light"
        :level="lightContrastInfo.level"
        :ratio="lightContrastInfo.ratio"
      />
      <DisplayContrastBadge
        v-if="darkContrastInfo"
        class="palettes-card__badges__dark"
        :level="darkContrastInfo.level"
        :ratio="darkContrastInfo.ratio"
      />
    </div>
    <p
      v-if="cvdInfo"
      class="palettes-card__cvd small text-body-secondary"
    >
      <template v-if="cvdInfo.safe">
        Color-blind safe
      </template>
      <template v-else>
        {{ cvdIssueLabels }}
      </template>
    </p>
    <div class="palettes-card__actions">
      <ButtonIcon
        label="Duplicate"
        :icon-left="IPhCopy"
        variant="outline-secondary"
        size="sm"
        @click="$emit('duplicate')"
      />
      <template v-if="editable">
        <ButtonIcon
          label="Edit"
          :icon-left="IPhPencilSimple"
          variant="outline-secondary"
          size="sm"
          @click="$emit('edit')"
        />
        <ButtonIcon
          label="Delete"
          :icon-left="IPhTrash"
          variant="outline-danger"
          size="sm"
          @click="$emit('remove')"
        />
      </template>
    </div>
  </BCard>
</template>

<style scoped lang="scss">
.palettes-card {
  &__swatches,
  &__badges,
  &__cvd {
    margin-bottom: 0.5rem;
  }

  &__badges {
    display: flex;
    gap: 0.5rem;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
  }
}
</style>
