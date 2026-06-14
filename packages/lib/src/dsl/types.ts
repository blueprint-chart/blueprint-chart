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
  /** `//` comment lines authored immediately above this node, text only (no `//`). */
  leadingComments?: string[]
}

export interface DataNode {
  type: DslNodeType.Data
  entries: PropertyNode[]
  /** `//` comment lines authored immediately above this node, text only (no `//`). */
  leadingComments?: string[]
}

export interface ColorizeNode {
  type: DslNodeType.Colorize
  target: string
  properties: PropertyNode[]
  fromHighlight?: boolean
  /** `//` comment lines authored immediately above this node, text only (no `//`). */
  leadingComments?: string[]
}

export interface HighlightNode {
  type: DslNodeType.Highlight
  target: string
  properties: PropertyNode[]
  /** `//` comment lines authored immediately above this node, text only (no `//`). */
  leadingComments?: string[]
}

export interface AreaFillNode {
  type: DslNodeType.AreaFill
  from: string
  to: string
  properties: PropertyNode[]
  /** `//` comment lines authored immediately above this node, text only (no `//`). */
  leadingComments?: string[]
}

export interface PointAnnotationNode {
  type: DslNodeType.Annotation
  kind: AnnotationKind.Point
  target: string
  properties: PropertyNode[]
  /** `//` comment lines authored immediately above this node, text only (no `//`). */
  leadingComments?: string[]
}

export interface RangeAnnotationNode {
  type: DslNodeType.Annotation
  kind: AnnotationKind.Range
  properties: PropertyNode[]
  /** `//` comment lines authored immediately above this node, text only (no `//`). */
  leadingComments?: string[]
}

export interface FreeAnnotationNode {
  type: DslNodeType.Annotation
  kind: AnnotationKind.Free
  properties: PropertyNode[]
  /** `//` comment lines authored immediately above this node, text only (no `//`). */
  leadingComments?: string[]
}

export type AnnotationNode = PointAnnotationNode | RangeAnnotationNode | FreeAnnotationNode

export interface SeriesNode {
  type: DslNodeType.Series
  name: string
  properties: PropertyNode[]
  /** `//` comment lines authored immediately above this node, text only (no `//`). */
  leadingComments?: string[]
}

export interface AnnotationVisibilityNode {
  type: DslNodeType.AnnotationVisibility
  action: AnnotationAction
  kind: AnnotationKind
  id: string
  /** `//` comment lines authored immediately above this node, text only (no `//`). */
  leadingComments?: string[]
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
  /** `//` comment lines authored immediately above this node, text only (no `//`). */
  leadingComments?: string[]
}

export interface TransformNode {
  type: DslNodeType.Transform
  transformType: string
  properties: PropertyNode[]
  /** `//` comment lines authored immediately above this node, text only (no `//`). */
  leadingComments?: string[]
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
