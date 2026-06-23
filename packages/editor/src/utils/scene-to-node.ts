import {
  DslNodeType,
  type SceneNode,
  type PropertyNode,
} from '@blueprint-chart/lib'
import type { SceneOverride } from '@/composables/useScenes'

function prop(key: string, value: string | number): PropertyNode {
  return { type: DslNodeType.Property, key, value, isPercentage: false }
}

export function sceneOverrideToSceneNode(override: SceneOverride): SceneNode {
  const properties: PropertyNode[] = []

  if (override.chartType !== undefined) {
    properties.push(prop('type', override.chartType))
  }
  for (const [k, v] of Object.entries(override.properties ?? {})) {
    if (v != null) {
      properties.push(prop(k, v as string | number))
    }
  }
  for (const [k, v] of Object.entries(override.chartTypeOptions ?? {})) {
    if (v != null) {
      properties.push(prop(k, v as string | number))
    }
  }

  return {
    type: DslNodeType.Scene,
    name: override.name ?? null,
    properties,
    data: null, // data is pre-resolved into ChartDefinition.data by the caller
    // shape-incompatible passthrough fields documented in the spec — not round-tripped
    colorizes: (override.colorizes ?? []) as never,
    highlights: (override.highlights ?? []) as never,
    areaFills: (override.areaFills ?? []) as never,
    annotations: (override.annotations ?? []) as never,
    series: (override.seriesOverrides ?? []) as never,
    transforms: (override.transforms ?? []) as never,
  }
}
