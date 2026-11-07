<template>
  <div class="d-flex flex-column gap-3">
    <BFormGroup
      label="Title"
      label-for="prop-title"
    >
      <BFormInput
        id="prop-title"
        v-model="title"
        placeholder="Chart title"
      />
    </BFormGroup>

    <BFormGroup
      label="Description"
      label-for="prop-description"
    >
      <BFormTextarea
        id="prop-description"
        v-model="description"
        placeholder="Short description"
        rows="2"
        max-rows="5"
      />
    </BFormGroup>

    <BFormGroup
      label="Alt text"
      label-for="prop-alt-text"
    >
      <BFormTextarea
        id="prop-alt-text"
        v-model="altText"
        placeholder="Describe the chart for screen readers"
        rows="2"
        max-rows="5"
      />
    </BFormGroup>

    <BFormGroup
      label="Byline"
      label-for="prop-byline"
    >
      <BFormInput
        id="prop-byline"
        v-model="byline"
        placeholder="Author or byline"
      />
    </BFormGroup>

    <BFormGroup
      label="Note"
      label-for="prop-note"
    >
      <BFormTextarea
        id="prop-note"
        v-model="note"
        placeholder="Additional note or caveat"
        rows="2"
        max-rows="4"
      />
    </BFormGroup>

    <BFormGroup
      label="Source"
      label-for="prop-source"
    >
      <BFormInput
        id="prop-source"
        v-model="source"
        placeholder="Data source"
      />
    </BFormGroup>

    <BFormGroup
      label="Source URL"
      label-for="prop-source-url"
    >
      <BFormInput
        id="prop-source-url"
        v-model="sourceUrl"
        type="url"
        placeholder="https://..."
      />
    </BFormGroup>

    <FormControlCheckbox
      v-model="getTheData"
      label="Show “Get the data” link"
    />
  </div>
</template>

<script setup lang="ts">
import { FormControlCheckbox } from '@blueprint-chart/ui'
import { useChartConfig } from '@/stores/chartConfig'

const { title, description, altText, byline, note, source, sourceUrl, layout } = useChartConfig()

const getTheData = computed({
  get: () => layout.value.getTheData,
  set: (v) => { layout.value.getTheData = v },
})
</script>
