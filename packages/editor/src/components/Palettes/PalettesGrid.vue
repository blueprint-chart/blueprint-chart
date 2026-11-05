<script setup lang="ts">
import { listPalettes } from '@blueprint-chart/lib'
import type { PaletteEntry } from '@blueprint-chart/lib'
import { useCustomPalettes } from '@/stores/customPalettes'
import type { CustomPalette } from '@/stores/customPalettes'
import PalettesCard from './PalettesCard.vue'
import PalettesDrawer from './PalettesDrawer.vue'
import PalettesNewCard from './PalettesNewCard.vue'
import PalettesSection from './PalettesSection.vue'

const { palettes, create, update, remove } = useCustomPalettes()
const builtIns: PaletteEntry[] = listPalettes()
const editingId = shallowRef<string | null>(null)
const pendingDelete = shallowRef<Pick<CustomPalette, 'id' | 'label'> | null>(null)

const editing = computed(() => palettes.value.find(p => p.id === editingId.value) ?? null)

// Keeps the drawer filled while it slides out after editing stops.
const drawerPalette = shallowRef<{ label: string, colors: string[] }>({ label: '', colors: [] })
watch(editing, (palette) => {
  if (palette) {
    drawerPalette.value = { label: palette.label, colors: [...palette.colors] }
  }
})

const drawerOpen = computed({
  get: () => editing.value !== null,
  set: (open: boolean) => {
    if (!open) {
      editingId.value = null
    }
  },
})

const confirming = computed({
  get: () => pendingDelete.value !== null,
  set: (open: boolean) => {
    if (!open) {
      pendingDelete.value = null
    }
  },
})

function updateEditing(value: { label: string, colors: string[] }) {
  if (editing.value) {
    update(editing.value.id, value)
  }
}

function duplicate({ label, colors }: { label: string, colors: readonly string[] }) {
  create(`${label} copy`, colors)
}

function addNew() {
  const palette = create('New palette', ['#dd5129', '#0f7ba2'])
  editingId.value = palette?.id ?? null
}

function confirmRemove() {
  if (pendingDelete.value) {
    editingId.value = null
    remove(pendingDelete.value.id)
  }
}

defineExpose({ addNew })
</script>

<template>
  <div class="palettes-grid">
    <PalettesSection
      title="Your palettes"
      :count="palettes.length"
    >
      <PalettesNewCard @click="addNew" />
      <PalettesCard
        v-for="palette in palettes"
        :key="palette.id"
        :label="palette.label"
        :colors="palette.colors"
        editable
        @duplicate="duplicate(palette)"
        @edit="editingId = palette.id"
        @remove="pendingDelete = palette"
      />
      <template
        v-if="!palettes.length"
        #note
      >
        <p class="palettes-grid__note">
          Duplicate a built-in palette or start from scratch.
        </p>
      </template>
    </PalettesSection>
    <PalettesSection
      title="Built-in"
      :count="builtIns.length"
    >
      <PalettesCard
        v-for="palette in builtIns"
        :key="palette.name"
        :label="palette.label"
        :colors="palette.colors"
        :editable="false"
        @duplicate="duplicate(palette)"
      />
    </PalettesSection>
    <PalettesDrawer
      v-model:open="drawerOpen"
      :model-value="drawerPalette"
      @update:model-value="updateEditing"
      @remove="pendingDelete = editing"
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
  display: flex;
  flex-direction: column;
  gap: 2.5rem;

  &__note {
    margin: 0.75rem 0 0;
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
  }
}
</style>
