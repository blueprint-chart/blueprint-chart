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

export interface AnnotationNode {
  type: 'annotation'
  target: string
  properties: PropertyNode[]
}

export interface SeriesNode {
  type: 'series'
  name: string
  properties: PropertyNode[]
}

export interface StepNode {
  type: 'step'
  name: string
  properties: PropertyNode[]
  data: DataNode | null
  highlights: HighlightNode[]
  areaFills: AreaFillNode[]
  annotations: AnnotationNode[]
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
  steps: StepNode[]
}
