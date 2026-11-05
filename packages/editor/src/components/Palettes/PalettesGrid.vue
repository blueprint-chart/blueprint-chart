<script setup lang="ts">
import { listPalettes } from '@blueprint-chart/lib'
import type { PaletteEntry } from '@blueprint-chart/lib'
import { useBreakpoint } from '@blueprint-chart/ui'
import { useCustomPalettes } from '@/stores/customPalettes'
import type { CustomPalette } from '@/stores/customPalettes'
import { usePanelStore } from '@/stores/panel'
import PalettesCard from './PalettesCard.vue'
import PalettesDetail from './PalettesDetail.vue'
import PalettesEmptyState from './PalettesEmptyState.vue'
import PalettesNewCard from './PalettesNewCard.vue'
import PalettesSection from './PalettesSection.vue'

const { palettes, create, update, remove } = useCustomPalettes()
const builtIns: PaletteEntry[] = listPalettes()
const { isNarrow } = useBreakpoint()
const panel = usePanelStore()
const { mode } = storeToRefs(panel)

const selectedKey = shallowRef<string | null>(null)
const pendingDelete = shallowRef<Pick<CustomPalette, 'id' | 'label'> | null>(null)
const gallery = useTemplateRef<HTMLElement>('gallery')

const customKey = (id: string) => `custom:${id}`
const builtInKey = (name: string) => `builtin:${name}`

const selectedCustom = computed(() => palettes.value.find(p => customKey(p.id) === selectedKey.value) ?? null)
const selectedBuiltIn = computed(() => builtIns.find(p => builtInKey(p.name) === selectedKey.value) ?? null)
const selected = computed(() => selectedCustom.value ?? selectedBuiltIn.value)

const panelTitle = computed(() => selected.value?.label ?? 'Palette details')

const gridClass = computed(() => ({
  'palettes-grid--narrow': isNarrow.value,
}))

const drawerOpen = computed({
  get: () => selected.value !== null,
  set: (open: boolean) => {
    if (!open) {
      selectedKey.value = null
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

function select(key: string) {
  selectedKey.value = selectedKey.value === key ? null : key
  if (selectedKey.value && mode.value === 'closed') {
    panel.open()
  }
}

function updateSelected({ label, colors }: { label: string, colors: readonly string[] }) {
  if (selectedCustom.value) {
    update(selectedCustom.value.id, { label, colors: [...colors] })
  }
}

function duplicate({ label, colors }: { label: string, colors: readonly string[] }) {
  create(`${label} copy`, colors)
}

function addNew() {
  const palette = create('New palette', ['#dd5129', '#0f7ba2'])
  if (palette) {
    select(customKey(palette.id))
  }
}

function confirmRemove() {
  if (pendingDelete.value) {
    if (selectedKey.value === customKey(pendingDelete.value.id)) {
      selectedKey.value = null
    }
    remove(pendingDelete.value.id)
  }
}

defineExpose({ addNew })
</script>

<template>
  <div
    class="palettes-grid"
    :class="gridClass"
  >
    <div
      ref="gallery"
      class="palettes-grid__gallery"
    >
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
          :selected="selectedKey === customKey(palette.id)"
          editable
          @select="select(customKey(palette.id))"
          @duplicate="duplicate(palette)"
          @remove="pendingDelete = palette"
        />
        <template
          v-if="!palettes.length"
          #note
        >
          <p class="palettes-grid__gallery__note">
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
          :selected="selectedKey === builtInKey(palette.name)"
          :editable="false"
          @select="select(builtInKey(palette.name))"
          @duplicate="duplicate(palette)"
        />
      </PalettesSection>
    </div>
    <PanelShell
      v-model:drawer-open="drawerOpen"
      :title="panelTitle"
      :container-ref="gallery"
      :show-close="false"
    >
      <PalettesDetail
        v-if="selected"
        :key="selectedKey ?? ''"
        :model-value="selected"
        :editable="selectedCustom !== null"
        @update:model-value="updateSelected"
        @duplicate="duplicate(selected)"
        @remove="pendingDelete = selectedCustom"
      />
      <PalettesEmptyState v-else-if="mode === 'docked'" />
    </PanelShell>
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
  flex: 1;
  min-height: 0;
  overflow: hidden;

  &--narrow {
    flex-direction: column;
  }

  &__gallery {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2.5rem;
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    padding: 1.75rem;
    position: relative;

    .palettes-grid--narrow & {
      padding: 1rem;
    }

    &__note {
      margin: 0.75rem 0 0;
      font-size: var(--bs-font-size-sm);
      color: var(--bs-secondary-color);
    }
  }
}

:deep(.layout-panel__header) {
  border-bottom: 1px solid var(--bc-hairline);
}
</style>
