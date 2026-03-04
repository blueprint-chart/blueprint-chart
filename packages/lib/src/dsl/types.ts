export interface PropertyNode {
  type: 'property'
  key: string
  value: string | number
  isPercentage: boolean
}

export interface DataNode {
  type: 'data'
  entries: PropertyNode[]
}

export interface HighlightNode {
  type: 'highlight'
  target: string
  properties: PropertyNode[]
}

export interface AreaFillNode {
  type: 'areafill'
  from: string
  to: string
  properties: PropertyNode[]
}

export interface PointAnnotationNode {
  type: 'annotation'
  kind: 'point'
  target: string
  properties: PropertyNode[]
}

export interface RangeAnnotationNode {
  type: 'annotation'
  kind: 'range'
  properties: PropertyNode[]
}

export interface FreeAnnotationNode {
  type: 'annotation'
  kind: 'free'
  properties: PropertyNode[]
}

export type AnnotationNode = PointAnnotationNode | RangeAnnotationNode | FreeAnnotationNode

export interface SeriesNode {
  type: 'series'
  name: string
  properties: PropertyNode[]
}

export interface SceneNode {
  type: 'scene'
  name: string | null
  properties: PropertyNode[]
  data: DataNode | null
  highlights: HighlightNode[]
  areaFills: AreaFillNode[]
  annotations: AnnotationNode[]
  series: SeriesNode[]
  transforms: TransformNode[]
}

/** @deprecated Use SceneNode instead */
export type StepNode = SceneNode

export interface TransformNode {
  type: 'transform'
  transformType: string
  properties: PropertyNode[]
}

export interface ChartNode {
  type: 'chart'
  chartType: string
  properties: PropertyNode[]
  data: DataNode | null
  highlights: HighlightNode[]
  areaFills: AreaFillNode[]
  annotations: AnnotationNode[]
  series: SeriesNode[]
  scenes: SceneNode[]
  transforms: TransformNode[]
}
