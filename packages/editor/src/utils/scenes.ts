import { SortDirection } from '@blueprint-chart/lib'
import type { AnnotationConfig } from '@blueprint-chart/lib'
import { TransformType } from '../enums'
import type { SceneOverride } from '@/composables/useScenes'

export interface VisibleAnnotation {
  config: AnnotationConfig
  key: string
  anchor: number
}

function repeatVisibleAt(anchor: number, repeat: number | 'always' | undefined, index: number): boolean {
  if (index < anchor) {
    return false
  }
  if (repeat === 'always') {
    return true
  }
  const count = typeof repeat === 'number' ? repeat : 1
  return index < anchor + count
}

/**
 * Annotations visible at `activeIndex` under the `repeat` rule, each tagged with
 * its anchor-correct internal key. Base annotations anchor at scene 0; a scene's
 * annotations anchor at that scene's index. With no active scene (activeIndex < 0),
 * all base annotations are returned.
 */
export function resolveVisibleAnnotations(
  baseAnnotations: AnnotationConfig[],
  scenes: SceneOverride[],
  activeIndex: number,
): VisibleAnnotation[] {
  const result: VisibleAnnotation[] = []
  baseAnnotations.forEach((config, i) => {
    if (activeIndex < 0 || repeatVisibleAt(0, config.repeat, activeIndex)) {
      result.push({ config, key: `base:${i}:${config.kind}`, anchor: 0 })
    }
  })
  if (activeIndex >= 0) {
    for (let j = 0; j <= activeIndex && j < scenes.length; j++) {
      const anns = scenes[j].annotations ?? []
      anns.forEach((config, i) => {
        if (repeatVisibleAt(j, config.repeat, activeIndex)) {
          result.push({ config, key: `s${j}:${i}:${config.kind}`, anchor: j })
        }
      })
    }
  }
  return result
}

/**
 * Fold scenes 0..index into a single resolved override.
 * Each field uses "last scene that defined it" semantics, so scene N
 * inherits anything set by scenes 0..N-1 that it doesn't override itself.
 *
 * Note: this operates on the editor's in-memory SceneOverride shape and is
 * used for assembling editor render args. The canonical scene-resolution
 * logic for DSL-shaped scenes lives in @blueprint-chart/lib `resolveScene`.
 */
export function resolveScene(scenes: SceneOverride[], index: number): SceneOverride | null {
  if (index < 0 || index >= scenes.length) {
    return null
  }
  const resolved: SceneOverride = { id: scenes[index].id, name: scenes[index].name }
  const hiddenIds = new Set<string>()
  for (let i = 0; i <= index; i++) {
    const s = scenes[i]
    if (s.chartType !== undefined) {
      resolved.chartType = s.chartType
    }
    if (s.data !== undefined) {
      resolved.data = s.data
    }
    if (s.chartTypeOptions !== undefined) {
      resolved.chartTypeOptions = resolved.chartTypeOptions
        ? { ...resolved.chartTypeOptions, ...s.chartTypeOptions }
        : { ...s.chartTypeOptions }
    }
    if (s.colorizes !== undefined && s.colorizes.length > 0) {
      resolved.colorizes = s.colorizes
    }
    else if (s.data !== undefined) {
      // When a scene provides new data, clear inherited colorizes
      // since they likely target different series names
      resolved.colorizes = []
    }
    // Highlights are ephemeral emphasis — only the current scene's
    // highlights apply; they do not cascade from earlier scenes.
    if (i === index) {
      resolved.highlights = s.highlights
    }
    if (s.areaFills !== undefined && s.areaFills.length > 0) {
      resolved.areaFills = s.areaFills
    }
    if (s.annotations !== undefined && s.annotations.length > 0) {
      resolved.annotations = s.annotations
    }
    if (s.annotationVisibility) {
      for (const v of s.annotationVisibility) {
        if (v.action === 'hide') {
          hiddenIds.add(v.id)
        }
        else {
          hiddenIds.delete(v.id)
        }
      }
    }
    if (s.seriesOverrides !== undefined && s.seriesOverrides.length > 0) {
      resolved.seriesOverrides = s.seriesOverrides
    }
    if (s.transforms !== undefined) {
      resolved.transforms = s.transforms
    }
    if (s.properties !== undefined) {
      resolved.properties = resolved.properties
        ? { ...resolved.properties, ...s.properties }
        : { ...s.properties }
    }
  }
  if (hiddenIds.size > 0) {
    resolved.hiddenAnnotationIds = hiddenIds
  }
  return resolved
}

/**
 * Find the index of the scene that provides data for scene at `index`.
 * Returns -1 if no scene in the chain defines custom data (base data is used).
 */
export function findDataSourceSceneIndex(scenes: SceneOverride[], index: number): number {
  if (index < 0 || index >= scenes.length) {
    return -1
  }
  for (let i = index; i >= 0; i--) {
    if (scenes[i]?.data !== undefined) {
      return i
    }
  }
  return -1
}

/**
 * Extract sort direction from resolved scene transforms.
 * Returns the direction from the last sort transform, or undefined if none.
 */
export function resolveSortFromTransforms(scene: SceneOverride | null): string | undefined {
  if (!scene?.transforms?.length) {
    return undefined
  }
  for (let i = scene.transforms.length - 1; i >= 0; i--) {
    if (scene.transforms[i].type === TransformType.Sort) {
      return scene.transforms[i].config?.direction ?? SortDirection.Ascending
    }
  }
  return undefined
}
