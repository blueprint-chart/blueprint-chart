import type * as d3 from 'd3'
import type { AnnotationSnapshot } from './snapshots'

// ---------------------------------------------------------------------------
// Annotation rendering context
// ---------------------------------------------------------------------------

export interface AnnotationContext {
  scaleX: d3.ScaleBand<string> | d3.ScalePoint<string> | d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>
  scaleY: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>
  data: { label: string, value: number }[]
  width: number
  height: number
  backgroundColor?: string
  orientation?: 'horizontal'
  transition?: boolean
  /** Pre-computed snapshots of old annotation positions (captured before DOM is cleared). */
  priorAnnotations?: Map<string, AnnotationSnapshot>
}
