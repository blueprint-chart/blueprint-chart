<script setup lang="ts">
import FormControlButtonGroup from './FormControlButtonGroup.vue'
import FormControlButtonGroupEntry from './FormControlButtonGroupEntry.vue'
</script>

<template>
  <Story title="Form/FormControl/FormControlButtonGroup">
    <Variant
      title="Default"
      :init-state="() => ({ value: 'left', label: 'Alignment' })"
    >
      <template #default="{ state }">
        <FormControlButtonGroup
          v-model="state.value"
          :label="state.label"
        >
          <FormControlButtonGroupEntry value="left" text="Left" />
          <FormControlButtonGroupEntry value="center" text="Center" />
          <FormControlButtonGroupEntry value="right" text="Right" />
        </FormControlButtonGroup>
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="modelValue"
        />
        <HstText
          v-model="state.label"
          title="label"
        />
      </template>
    </Variant>

    <Variant
      title="With sections"
      :init-state="() => ({ value: 'left', label: 'Alignment' })"
    >
      <template #default="{ state }">
        <FormControlButtonGroup
          v-model="state.value"
          :label="state.label"
        >
          <FormControlButtonGroupEntry value="left" text="Left" />
          <FormControlButtonGroupEntry value="center" text="Center" />
          <FormControlButtonGroupEntry value="right" text="Right" />
          <template #section:left>
            <div class="d-flex flex-column gap-2 mt-2">
              Left-aligned content options
            </div>
          </template>
          <template #section:center>
            <div class="d-flex flex-column gap-2 mt-2">
              Center-aligned content options
            </div>
          </template>
          <template #section:right>
            <div class="d-flex flex-column gap-2 mt-2">
              Right-aligned content options
            </div>
          </template>
        </FormControlButtonGroup>
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="modelValue"
        />
      </template>
    </Variant>
    <Variant
      title="With icons"
      :init-state="() => ({ value: 'left', label: 'Alignment' })"
    >
      <template #default="{ state }">
        <FormControlButtonGroup
          v-model="state.value"
          :label="state.label"
        >
          <FormControlButtonGroupEntry value="left" text="Left">
            <template #icon-left>
              <IconPhTextAlignLeft />
            </template>
          </FormControlButtonGroupEntry>
          <FormControlButtonGroupEntry value="center" text="Center">
            <template #icon-left>
              <IconPhTextAlignCenter />
            </template>
          </FormControlButtonGroupEntry>
          <FormControlButtonGroupEntry value="right" text="Right">
            <template #icon-left>
              <IconPhTextAlignRight />
            </template>
          </FormControlButtonGroupEntry>
        </FormControlButtonGroup>
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="modelValue"
        />
      </template>
    </Variant>
    <Variant
      title="Block (full width)"
      :init-state="() => ({ value: 'left', label: 'Alignment' })"
    >
      <template #default="{ state }">
        <FormControlButtonGroup
          v-model="state.value"
          :label="state.label"
          block
        >
          <FormControlButtonGroupEntry value="left" text="Left" />
          <FormControlButtonGroupEntry value="center" text="Center" />
          <FormControlButtonGroupEntry value="right" text="Right" />
        </FormControlButtonGroup>
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="modelValue"
        />
      </template>
    </Variant>

    <Variant
      title="Block with many options (overflow → dropdown)"
      :init-state="() => ({ value: 'linear', label: 'Interpolation' })"
    >
      <template #default="{ state }">
        <div class="form-control-button-group-story__narrow">
          <FormControlButtonGroup
            v-model="state.value"
            :label="state.label"
            block
          >
            <FormControlButtonGroupEntry value="linear" text="Linear" />
            <FormControlButtonGroupEntry value="basis" text="Basis" />
            <FormControlButtonGroupEntry value="cardinal" text="Cardinal" />
            <FormControlButtonGroupEntry value="step" text="Step" />
            <FormControlButtonGroupEntry value="natural" text="Natural" />
          </FormControlButtonGroup>
        </div>
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="modelValue"
        />
      </template>
    </Variant>
  </Story>
</template>

<style scoped>
.form-control-button-group-story__narrow {
  max-width: 200px;
}
</style>
