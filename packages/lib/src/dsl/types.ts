import type { DslNodeType, AnnotationKind, AnnotationAction } from '../enums'

export interface PropertyNode {
  type: DslNodeType.Property
  key: string
  value: string | number
  isPercentage: boolean
  values?: (string | number)[]
  /**
   * Set when a data row's key was written as a quoted string and collides
   * with the reserved `series` meta-row key. A quoted `"series"` row is a
   * real data category; only the unquoted `series = ...` row names columns.
   */
  quotedKey?: boolean
}

export interface DataNode {
  type: DslNodeType.Data
  entries: PropertyNode[]
}

export interface ColorizeNode {
  type: DslNodeType.Colorize
  target: string
  properties: PropertyNode[]
  fromHighlight?: boolean
}

export interface HighlightNode {
  type: DslNodeType.Highlight
  target: string
  properties: PropertyNode[]
}

export interface AreaFillNode {
  type: DslNodeType.AreaFill
  from: string
  to: string
  properties: PropertyNode[]
}

export interface PointAnnotationNode {
  type: DslNodeType.Annotation
  kind: AnnotationKind.Point
  target: string
  properties: PropertyNode[]
}

export interface RangeAnnotationNode {
  type: DslNodeType.Annotation
  kind: AnnotationKind.Range
  properties: PropertyNode[]
}

export interface FreeAnnotationNode {
  type: DslNodeType.Annotation
  kind: AnnotationKind.Free
  properties: PropertyNode[]
}

export type AnnotationNode = PointAnnotationNode | RangeAnnotationNode | FreeAnnotationNode

export interface SeriesNode {
  type: DslNodeType.Series
  name: string
  properties: PropertyNode[]
}

export interface AnnotationVisibilityNode {
  type: DslNodeType.AnnotationVisibility
  action: AnnotationAction
  kind: AnnotationKind
  id: string
}

export interface SceneNode {
  type: DslNodeType.Scene
  name: string | null
  properties: PropertyNode[]
  data: DataNode | null
  colorizes: ColorizeNode[]
  highlights: HighlightNode[]
  areaFills: AreaFillNode[]
  annotations: AnnotationNode[]
  annotationVisibility: AnnotationVisibilityNode[]
  series: SeriesNode[]
  transforms: TransformNode[]
}

export interface TransformNode {
  type: DslNodeType.Transform
  transformType: string
  properties: PropertyNode[]
}

export interface ChartNode {
  type: DslNodeType.Chart
  chartType: string
  properties: PropertyNode[]
  data: DataNode | null
  colorizes: ColorizeNode[]
  highlights: HighlightNode[]
  areaFills: AreaFillNode[]
  annotations: AnnotationNode[]
  annotationVisibility: AnnotationVisibilityNode[]
  series: SeriesNode[]
  scenes: SceneNode[]
  transforms: TransformNode[]
}
