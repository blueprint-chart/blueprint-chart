// ---------------------------------------------------------------------------
// Central enum definitions for @blueprint-chart/lib
// Every string-discriminator / option-value used across the charting library
// is declared here so that consumers never need to hard-code raw strings.
// ---------------------------------------------------------------------------

// --- Chart Type ---------------------------------------------------------------
export enum ChartType {
  BarVertical = 'bar-vertical',
  BarHorizontal = 'bar-horizontal',
  BarMulti = 'bar-multi',
  ColumnStacked = 'column-stacked',
  BarStacked = 'bar-stacked',
  BarSplit = 'bar-split',
  BarGrouped = 'bar-grouped',
  Line = 'line',
  LineMulti = 'line-multi',
  Area = 'area',
  AreaStacked = 'area-stacked',
  Donut = 'donut',
  Pie = 'pie',
  // Aliases (registered separately in registry)
  VerticalBar = 'vertical-bar',
  HorizontalBar = 'horizontal-bar',
}

// --- Axis --------------------------------------------------------------------
export enum AxisDirection {
  Left = 'left',
  Right = 'right',
}

export enum ScaleType {
  Linear = 'linear',
  Log = 'log',
}

export enum GridStyle {
  Solid = 'solid',
  Dashed = 'dashed',
  Dotted = 'dotted',
  None = 'none',
}

export enum LabelPosition {
  Auto = 'auto',
  Inside = 'inside',
  Outside = 'outside',
  Off = 'off',
}

export enum LabelRotation {
  Auto = 'auto',
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export enum TickPosition {
  Above = 'above',
  Below = 'below',
}

// --- Frame -------------------------------------------------------------------
export enum FrameSizing {
  Auto = 'auto',
  Standard = 'standard',
  AspectRatio = 'aspect-ratio',
}

// --- Compass & Annotation ----------------------------------------------------
export enum CompassDirection {
  NW = 'NW',
  N = 'N',
  NE = 'NE',
  E = 'E',
  SE = 'SE',
  S = 'S',
  SW = 'SW',
  W = 'W',
  Center = 'center',
}

export enum AnnotationLineStyle {
  Direct = 'direct',
  CurveLeft = 'curve-left',
  CurveRight = 'curve-right',
  Elbow = 'elbow',
}

export enum StrokeStyle {
  Solid = 'solid',
  Dotted = 'dotted',
  Dashed = 'dashed',
}

export enum AnnotationKind {
  Point = 'point',
  Range = 'range',
  Free = 'free',
}

/**
 * Maps an annotation kind to its DSL block keyword. Used by the serializer,
 * the editor's DSL output, and the validator so the three never drift apart
 * (e.g. `point` -> `annotation`, not the enum's raw value).
 */
export const ANNOTATION_KIND_KEYWORD: Record<AnnotationKind, string> = {
  [AnnotationKind.Point]: 'annotation',
  [AnnotationKind.Range]: 'range',
  [AnnotationKind.Free]: 'note',
}

export enum RangeAnchor {
  Start = 'start',
  Center = 'center',
  End = 'end',
}

export enum Orientation {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

// --- Line Symbols ------------------------------------------------------------
export enum SymbolShape {
  Circle = 'circle',
  Square = 'square',
  Diamond = 'diamond',
  Triangle = 'triangle',
  TriangleDown = 'triangleDown',
  Cross = 'cross',
  Star = 'star',
}

export enum SymbolShowOn {
  All = 'all',
  First = 'first',
  Last = 'last',
  FirstLast = 'firstLast',
}

export enum SymbolStyle {
  Filled = 'filled',
  Hollow = 'hollow',
}

// --- Chart Options -----------------------------------------------------------
export enum SortDirection {
  Ascending = 'ascending',
  Descending = 'descending',
  None = 'none',
}

export enum SortMode {
  Total = 'total',
  WithinGroups = 'within-groups',
  None = 'none',
}

export enum LegendPosition {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
}

export enum Anchor {
  Start = 'start',
  Middle = 'middle',
  End = 'end',
}

export enum ValueLabelPosition {
  Inside = 'inside',
  Outside = 'outside',
  Auto = 'auto',
}

export enum CrosshairDirection {
  Both = 'both',
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export enum CrosshairStyle {
  Solid = 'solid',
  Dashed = 'dashed',
  Dotted = 'dotted',
}

export enum StackMode {
  Normal = 'normal',
  Percent = 'percent',
}

export enum LineStyle {
  Solid = 'solid',
  Dashed = 'dashed',
  Dotted = 'dotted',
  None = 'none',
}

// --- ChartOptionDef type field -----------------------------------------------
export enum ChartOptionType {
  Colors = 'colors',
  Boolean = 'boolean',
  Select = 'select',
  Text = 'text',
  NumberFormat = 'numberFormat',
  DateFormat = 'dateFormat',
}

// --- Direct Labelling --------------------------------------------------------
export enum DirectLabelMode {
  Off = '',
  Auto = 'auto',
  Outside = 'outside',
  Inside = 'inside',
}

// --- Interpolation -----------------------------------------------------------
export enum Interpolation {
  Linear = 'linear',
  MonotoneX = 'monotoneX',
  Step = 'step',
  StepBefore = 'stepBefore',
  StepAfter = 'stepAfter',
  Basis = 'basis',
  Cardinal = 'cardinal',
  CatmullRom = 'catmullRom',
}

// --- DSL Node Types ----------------------------------------------------------
export enum DslNodeType {
  Property = 'property',
  Data = 'data',
  Colorize = 'colorize',
  Highlight = 'highlight',
  AreaFill = 'area-fill',
  Annotation = 'annotation',
  Series = 'series',
  Scene = 'scene',
  Transform = 'transform',
  Chart = 'chart',
}
