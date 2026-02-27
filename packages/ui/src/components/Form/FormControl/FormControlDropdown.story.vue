<script setup lang="ts">
import FormControlDropdown from './FormControlDropdown.vue'
import FormControlDropdownEntry from './FormControlDropdownEntry.vue'
</script>

<template>
  <Story title="Form/FormControl/FormControlDropdown">
    <Variant
      title="Default"
      :init-state="() => ({ value: 'bar', label: 'Chart type' })"
    >
      <template #default="{ state }">
        <FormControlDropdown
          id="story-dropdown"
          v-model="state.value"
          :label="state.label"
        >
          <FormControlDropdownEntry
            value="bar"
            label="Bar chart"
            description="Compare values across categories"
          />
          <FormControlDropdownEntry
            value="line"
            label="Line chart"
            description="Show trends over time"
          />
          <FormControlDropdownEntry
            value="pie"
            label="Pie chart"
            description="Show parts of a whole"
          />
          <FormControlDropdownEntry
            value="donut"
            label="Donut chart"
            description="Like pie, with a hollow centre"
          />
        </FormControlDropdown>
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
      title="With icons"
      :init-state="() => ({ value: 'bar', label: 'Chart type' })"
    >
      <template #default="{ state }">
        <FormControlDropdown
          id="story-dropdown-icon"
          v-model="state.value"
          :label="state.label"
        >
          <FormControlDropdownEntry
            value="bar"
            label="Bar chart"
            description="Compare values across categories"
          >
            <template #icon>
              <IconPhChartBar />
            </template>
          </FormControlDropdownEntry>
          <FormControlDropdownEntry
            value="line"
            label="Line chart"
            description="Show trends over time"
          >
            <template #icon>
              <IconPhChartLineUp />
            </template>
          </FormControlDropdownEntry>
          <FormControlDropdownEntry
            value="pie"
            label="Pie chart"
            description="Show parts of a whole"
          >
            <template #icon>
              <IconPhChartPieSlice />
            </template>
          </FormControlDropdownEntry>
          <FormControlDropdownEntry
            value="donut"
            label="Donut chart"
            description="Like pie, with a hollow centre"
          >
            <template #icon>
              <IconPhChartDonut />
            </template>
          </FormControlDropdownEntry>
        </FormControlDropdown>
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="modelValue"
        />
      </template>
    </Variant>

    <Variant
      title="With visuals"
      :init-state="() => ({ value: 'bar', label: 'Chart type' })"
    >
      <template #default="{ state }">
        <FormControlDropdown
          id="story-dropdown-visual"
          v-model="state.value"
          :label="state.label"
        >
          <FormControlDropdownEntry
            value="bar"
            label="Bar chart"
            description="Compare values across categories"
            visual="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect x='4' y='20' width='8' height='16' fill='%234a90d9'/><rect x='16' y='10' width='8' height='26' fill='%234a90d9'/><rect x='28' y='16' width='8' height='20' fill='%234a90d9'/></svg>"
          />
          <FormControlDropdownEntry
            value="line"
            label="Line chart"
            description="Show trends over time"
            visual="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><polyline points='4,30 14,14 26,22 36,8' fill='none' stroke='%234a90d9' stroke-width='2'/></svg>"
          />
          <FormControlDropdownEntry
            value="pie"
            label="Pie chart"
            description="Show parts of a whole"
            visual="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='16' fill='%234a90d9'/><path d='M20,20 L20,4 A16,16 0 0,1 36,20 Z' fill='%2367b7dc'/></svg>"
          />
        </FormControlDropdown>
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="modelValue"
        />
      </template>
    </Variant>
    <Variant
      title="Block"
      :init-state="() => ({ value: 'linear', label: 'Interpolation' })"
    >
      <template #default="{ state }">
        <FormControlDropdown
          id="story-dropdown-block"
          v-model="state.value"
          :label="state.label"
          block
        >
          <FormControlDropdownEntry
            value="linear"
            label="Linear"
          />
          <FormControlDropdownEntry
            value="basis"
            label="Basis"
          />
          <FormControlDropdownEntry
            value="cardinal"
            label="Cardinal"
          />
          <FormControlDropdownEntry
            value="step"
            label="Step"
          />
          <FormControlDropdownEntry
            value="natural"
            label="Natural"
          />
        </FormControlDropdown>
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
