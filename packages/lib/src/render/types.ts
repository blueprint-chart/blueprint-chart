// packages/lib/src/render/types.ts
import type { SortDirection, SortMode } from '../enums'
import type {
  ChartData,
  ChartTypeOptions,
  ColorizeConfig,
  HighlightConfig,
  AreaFillConfig,
  AnnotationConfig,
  SeriesOverride,
  FrameOptions,
} from '../charts/types'
import type { PropertyNode, SceneNode } from '../dsl/types'
import type { TransitionMode } from '../transitions/types'

export interface ChartDefinition {
  chartType: string
  data: ChartData
  options?: Partial<ChartTypeOptions>
  properties?: PropertyNode[]
  frame?: FrameOptions
  colorizes?: ColorizeConfig[]
  highlights?: HighlightConfig[]
  areaFills?: AreaFillConfig[]
  annotations?: AnnotationConfig[]
  seriesOverrides?: SeriesOverride[]
  scenes?: SceneNode[]
  sort?: SortDirection
  sortMode?: SortMode
  theme?: string
}

export interface RenderOptions {
  sceneIndex?: number
  transition?: boolean
  /**
   * Transition mode. Defaults to `'transform'` when omitted. Only the
   * `transform` mode runs in v1; other values warn-once at the orchestrator
   * and fall back to snap. See `transitions/index.ts`.
   */
  transitionMode?: TransitionMode
  thumbnail?: boolean
  stripColors?: boolean
  ignoreLayout?: boolean
  padding?: string
  theme?: string
}

export interface ResolvedChartState {
  chartType: string
  data: ChartData
  options: Partial<ChartTypeOptions>
  frame?: FrameOptions
  colorizes: ColorizeConfig[]
  highlights: HighlightConfig[]
  areaFills: AreaFillConfig[]
  annotations: AnnotationConfig[]
  seriesOverrides: SeriesOverride[]
  sort?: SortDirection
  sortMode?: SortMode
  theme?: string
}
