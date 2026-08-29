<script setup lang="ts">
import ButtonIcon from './ButtonIcon.vue'
import PhPlus from '~icons/ph/plus'
import PhTrash from '~icons/ph/trash'
import PhPencil from '~icons/ph/pencil'
import PhArrowRight from '~icons/ph/arrow-right'
import PhDownload from '~icons/ph/download'
</script>

<template>
  <Story title="Button/ButtonIcon">
    <Variant title="Icon left with label">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <ButtonIcon
          :icon-left="PhPlus"
          label="Add"
          variant="primary"
        />
        <ButtonIcon
          :icon-left="PhPencil"
          label="Edit"
          variant="secondary"
        />
        <ButtonIcon
          :icon-left="PhTrash"
          label="Delete"
          variant="danger"
        />
      </div>
    </Variant>
    <Variant title="Icon right">
      <ButtonIcon
        :icon-right="PhArrowRight"
        label="Continue"
        variant="primary"
      />
    </Variant>
    <Variant title="Square (icon only)">
      <div style="display: flex; gap: 0.5rem;">
        <ButtonIcon
          :icon-left="PhPlus"
          square
          hide-label
          label="Add"
          variant="primary"
        />
        <ButtonIcon
          :icon-left="PhPencil"
          square
          hide-label
          label="Edit"
          variant="secondary"
        />
        <ButtonIcon
          :icon-left="PhTrash"
          square
          hide-label
          label="Delete"
          variant="danger"
        />
      </div>
    </Variant>
    <Variant title="Loading">
      <div style="display: flex; gap: 0.5rem;">
        <ButtonIcon
          :icon-left="PhDownload"
          label="Download"
          variant="primary"
          loading
          loading-text="Downloading..."
        />
        <ButtonIcon
          :icon-left="PhDownload"
          square
          hide-label
          label="Download"
          variant="secondary"
          loading
        />
      </div>
    </Variant>
    <Variant title="With counter">
      <ButtonIcon
        :icon-left="PhDownload"
        label="Downloads"
        variant="primary"
        :counter="42"
      />
    </Variant>
    <Variant title="Sizes">
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <ButtonIcon
          :icon-left="PhPlus"
          label="Small"
          variant="primary"
          size="sm"
        />
        <ButtonIcon
          :icon-left="PhPlus"
          label="Medium"
          variant="primary"
        />
        <ButtonIcon
          :icon-left="PhPlus"
          label="Large"
          variant="primary"
          size="lg"
        />
      </div>
    </Variant>
  </Story>
</template>
