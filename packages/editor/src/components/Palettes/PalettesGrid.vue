<script setup lang="ts">
import { listPalettes } from '@blueprint-chart/lib'
import type { PaletteEntry } from '@blueprint-chart/lib'
import { ButtonIcon } from '@blueprint-chart/ui'
import { useCustomPalettes } from '@/stores/customPalettes'
import type { CustomPalette } from '@/stores/customPalettes'
import PalettesCard from './PalettesCard.vue'
import PalettesCardEditor from './PalettesCardEditor.vue'
import IPhPlus from '~icons/ph/plus'

const { palettes, create, update, remove } = useCustomPalettes()
const builtIns: PaletteEntry[] = listPalettes()
const editingId = shallowRef<string | null>(null)

function duplicate({ label, colors }: { label: string, colors: string[] }) {
  create(`${label} copy`, colors)
}

function addNew() {
  const palette = create('New palette', ['#dd5129', '#0f7ba2'])
  editingId.value = palette?.id ?? null
}

const pendingDelete = shallowRef<CustomPalette | null>(null)
const confirming = computed({
  get: () => pendingDelete.value !== null,
  set: (open: boolean) => {
    if (!open) {
      pendingDelete.value = null
    }
  },
})

function confirmRemove() {
  if (pendingDelete.value) {
    editingId.value = null
    remove(pendingDelete.value.id)
  }
}
</script>

<template>
  <div class="palettes-grid">
    <template
      v-for="palette in palettes"
      :key="palette.id"
    >
      <PalettesCardEditor
        v-if="editingId === palette.id"
        class="palettes-grid__item"
        :model-value="{ label: palette.label, colors: palette.colors }"
        @update:model-value="update(palette.id, $event)"
        @remove="pendingDelete = palette"
        @done="editingId = null"
      />
      <PalettesCard
        v-else
        class="palettes-grid__item"
        :label="palette.label"
        :colors="palette.colors"
        editable
        @duplicate="duplicate(palette)"
        @edit="editingId = palette.id"
        @remove="pendingDelete = palette"
      />
    </template>
    <BCard class="palettes-grid__item palettes-grid__new">
      <ButtonIcon
        label="New palette"
        :icon-left="IPhPlus"
        variant="outline-primary"
        @click="addNew"
      />
    </BCard>
    <PalettesCard
      v-for="palette in builtIns"
      :key="palette.name"
      class="palettes-grid__item"
      :label="palette.label"
      :colors="palette.colors"
      :editable="false"
      @duplicate="duplicate(palette)"
    />
    <BModal
      v-model="confirming"
      title="Delete palette"
      ok-title="Delete"
      ok-variant="danger"
      @ok="confirmRemove"
    >
      Delete "{{ pendingDelete?.label }}"? Charts that use its colors keep them.
    </BModal>
  </div>
</template>

<style scoped lang="scss">
.palettes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 1rem;
}
</style>
