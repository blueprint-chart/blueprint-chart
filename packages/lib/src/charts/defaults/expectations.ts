import { ChartType, DirectLabelMode, LabelRotation } from '../../enums'
import { Concern } from './types'
import type { Matrix } from './types'

/**
 * Audit matrix: Concern × ChartType → Cell.
 *
 * Every entry cites a wiki rule (see /home/dev/Obsidian/Blueprint Chart/wiki/).
 * Phase 2 of the chart defaults audit populates the inner records.
 *
 * Cell statuses:
 *   asserted: current default already matches the wiki rule (test asserts it)
 *   todo:     wiki rule has a target, current default doesn't match (phase 4)
 *   na:       concern doesn't apply to this chart type
 *   open:     wiki has no rule on this cell — flagged for follow-up
 */

// ---------------------------------------------------------------------------
// Rule citation constants — referenced by multiple cells
// ---------------------------------------------------------------------------

const RULE_DIRECT_LABEL_PREFERRED = 'wiki/concepts/labels-and-legends.md § Direct labeling is preferred'
const RULE_WHEN_TO_USE_LEGENDS = 'wiki/concepts/labels-and-legends.md § When to use legends'
const RULE_VALUE_LABELS = 'wiki/concepts/labels-and-legends.md § Value labels'
const RULE_NEVER_ROTATE = 'wiki/concepts/handbook-typography.md § Readability rules'
const RULE_HANDBOOK_BAR_HORIZONTAL = 'wiki/concepts/handbook-chart-types.md § Bar Chart (Horizontal)'
const RULE_HANDBOOK_BAR_VERTICAL = 'wiki/concepts/handbook-chart-types.md § Bar Chart (Vertical)'
const RULE_HANDBOOK_LINE_MULTI = 'wiki/concepts/handbook-chart-types.md § Multi-series Line Chart'

// ---------------------------------------------------------------------------

export const MATRIX: Matrix = {
  // =========================================================================
  // Concern: DirectLabelling
  // optionKey verdict on 'directLabelling' (visibility/mode); anchor is secondary
  // =========================================================================
  [Concern.DirectLabelling]: {
    // single-series; directLabelling option is not registered for this chart
    [ChartType.BarVertical]: { status: 'na', reason: 'single-series vertical bar; directLabelling is not registered for this chart type' },
    // single-series; directLabelling option is not registered for this chart
    [ChartType.BarHorizontal]: { status: 'na', reason: 'single-series horizontal bar; directLabelling is not registered for this chart type' },
    // multi-series bar; current default Off, wiki says direct labels preferred over legend
    [ChartType.BarMulti]: {
      status: 'todo',
      optionKey: 'directLabelling',
      current: DirectLabelMode.Off,
      target: DirectLabelMode.Auto,
      rule: RULE_DIRECT_LABEL_PREFERRED,
      notes: 'Wiki says direct labelling is preferred over legend for multi-series bar charts; default should be Auto rather than Off.',
    },
    // stacked horizontal bar; wiki is silent on whether labels on individual segments are practical for stacking
    [ChartType.BarStacked]: {
      status: 'open',
      optionKey: 'directLabelling',
      current: DirectLabelMode.Off,
      notes: 'Wiki warns stacking makes individual segment labels hard to place but does not prescribe a default for stacked bar; no wiki rule found.',
    },
    // split bar panels; directLabelling is not registered for this chart type
    [ChartType.BarSplit]: { status: 'na', reason: 'bar-split panels have no directLabelling option registered; each panel is already labelled by series' },
    // grouped horizontal bars; directLabelling is not registered for this chart type
    [ChartType.BarGrouped]: { status: 'na', reason: 'grouped horizontal bars have no directLabelling option registered' },
    // stacked column; wiki is silent on whether stacked segment labels are practical
    [ChartType.ColumnStacked]: {
      status: 'open',
      optionKey: 'directLabelling',
      current: DirectLabelMode.Off,
      notes: 'Wiki warns stacking makes individual segment labels hard to place but does not prescribe a default for column-stacked; no wiki rule found.',
    },
    // single-series; directLabelling option is not registered for this chart
    [ChartType.Line]: { status: 'na', reason: 'single-series line; directLabelling is not registered for this chart type' },
    // multi-line; default is Auto (overridden from Off); wiki prescribes direct end-of-line labels → asserted
    [ChartType.LineMulti]: {
      status: 'asserted',
      optionKey: 'directLabelling',
      target: DirectLabelMode.Auto,
      rule: RULE_HANDBOOK_LINE_MULTI,
    },
    // single-series; directLabelling option is not registered for this chart
    [ChartType.Area]: { status: 'na', reason: 'single-series area; directLabelling is not registered for this chart type' },
    // stacked area; wiki is silent on direct labels in stacked area context
    [ChartType.AreaStacked]: {
      status: 'open',
      optionKey: 'directLabelling',
      current: DirectLabelMode.Off,
      notes: 'Wiki warns stacking makes individual segment labels hard to place but does not prescribe a default for stacked area; no wiki rule found.',
    },
    // donut; registered but default Off; wiki says "label each slice directly" → should be Auto
    [ChartType.Donut]: {
      status: 'todo',
      optionKey: 'directLabelling',
      current: DirectLabelMode.Off,
      target: DirectLabelMode.Auto,
      rule: RULE_DIRECT_LABEL_PREFERRED,
      notes: 'Wiki says direct labelling is preferred and labels each slice directly; donut center metric exists so Auto (inside-capable) is the appropriate target.',
    },
    // pie; registered but default Off; wiki says "label each slice directly" → should be Auto
    [ChartType.Pie]: {
      status: 'todo',
      optionKey: 'directLabelling',
      current: DirectLabelMode.Off,
      target: DirectLabelMode.Auto,
      rule: RULE_DIRECT_LABEL_PREFERRED,
      notes: 'Wiki says direct labelling is preferred for pie charts; Auto lets the renderer place labels inside large slices and outside small ones.',
    },
  },

  // =========================================================================
  // Concern: Legend
  // optionKey verdict on 'legend' (boolean visibility); position/anchor are secondary
  // =========================================================================
  [Concern.Legend]: {
    // single-series; legend option is not registered for this chart
    [ChartType.BarVertical]: { status: 'na', reason: 'single-series vertical bar; legend option is not registered' },
    // single-series; legend option is not registered for this chart
    [ChartType.BarHorizontal]: { status: 'na', reason: 'single-series horizontal bar; legend option is not registered' },
    // multi-series bar; current default true; wiki says legend is a fallback not the primary default
    [ChartType.BarMulti]: {
      status: 'todo',
      optionKey: 'legend',
      current: true,
      target: false,
      rule: RULE_WHEN_TO_USE_LEGENDS,
      notes: 'Wiki says use a legend only when direct labels would overlap or are impractical; prefer direct labelling as the default; legend should default to false.',
    },
    // stacked horizontal bar; current default true; legend is reasonable fallback for stacked since direct labels are hard
    [ChartType.BarStacked]: {
      status: 'todo',
      optionKey: 'legend',
      current: true,
      target: false,
      rule: RULE_WHEN_TO_USE_LEGENDS,
      notes: 'Wiki treats legend as a fallback; even for stacked bars the wiki preference is to avoid a separate legend when possible. Phase 4 should verify whether a legend is truly necessary when stack labels are off.',
    },
    // split bar panels; current default true; each panel is self-labelled by series but legend still registered
    [ChartType.BarSplit]: {
      status: 'todo',
      optionKey: 'legend',
      current: true,
      target: false,
      rule: RULE_WHEN_TO_USE_LEGENDS,
      notes: 'Split bar renders each series as its own labelled panel, making a separate legend redundant; wiki says legend is a fallback only.',
    },
    // grouped horizontal bars; current default true; wiki says legend is fallback
    [ChartType.BarGrouped]: {
      status: 'todo',
      optionKey: 'legend',
      current: true,
      target: false,
      rule: RULE_WHEN_TO_USE_LEGENDS,
      notes: 'Wiki accepts legend for multi-series bar as a fallback when direct labels are impractical; default should still be false with the user opting in.',
    },
    // stacked column; current default true; wiki treats legend as fallback
    [ChartType.ColumnStacked]: {
      status: 'todo',
      optionKey: 'legend',
      current: true,
      target: false,
      rule: RULE_WHEN_TO_USE_LEGENDS,
      notes: 'Wiki says legend is a fallback not the primary default; prefer direct labelling or no legend for stacked columns.',
    },
    // single-series; legend option is not registered for this chart
    [ChartType.Line]: { status: 'na', reason: 'single-series line; legend option is not registered' },
    // multi-line; current default true; wiki says prefer direct end-of-line labels over a legend
    [ChartType.LineMulti]: {
      status: 'todo',
      optionKey: 'legend',
      current: true,
      target: false,
      rule: RULE_WHEN_TO_USE_LEGENDS,
      notes: 'Wiki says label lines directly instead of using a legend; since directLabelling defaults to Auto for line-multi, legend should default to false.',
    },
    // single-series; legend option is not registered for this chart
    [ChartType.Area]: { status: 'na', reason: 'single-series area; legend option is not registered' },
    // stacked area; current default true; wiki treats legend as fallback
    [ChartType.AreaStacked]: {
      status: 'todo',
      optionKey: 'legend',
      current: true,
      target: false,
      rule: RULE_WHEN_TO_USE_LEGENDS,
      notes: 'Wiki says legend is a fallback; for stacked area direct labelling is ambiguous but the default should still lean toward no legend.',
    },
    // donut; current default true; wiki says direct slice labels are the default
    [ChartType.Donut]: {
      status: 'todo',
      optionKey: 'legend',
      current: true,
      target: false,
      rule: RULE_WHEN_TO_USE_LEGENDS,
      notes: 'Wiki says label each slice directly; a legend is the fallback, not the primary default; donut should default to false.',
    },
    // pie; current default true; wiki says direct slice labels are the default
    [ChartType.Pie]: {
      status: 'todo',
      optionKey: 'legend',
      current: true,
      target: false,
      rule: RULE_WHEN_TO_USE_LEGENDS,
      notes: 'Wiki says label each slice directly; a legend is the fallback, not the primary default; pie should default to false.',
    },
  },

  // =========================================================================
  // Concern: ValueLabels
  // optionKey verdict on 'valueLabels' (boolean visibility); position is secondary
  // =========================================================================
  [Concern.ValueLabels]: {
    // vertical bar; current default false; wiki says optional/off unless precision is needed → asserted
    [ChartType.BarVertical]: {
      status: 'asserted',
      optionKey: 'valueLabels',
      target: false,
      rule: RULE_HANDBOOK_BAR_VERTICAL,
    },
    // horizontal bar; current default true (barHorizontalValueLabelsOpt); wiki says label bars at end → asserted
    [ChartType.BarHorizontal]: {
      status: 'asserted',
      optionKey: 'valueLabels',
      target: true,
      rule: RULE_HANDBOOK_BAR_HORIZONTAL,
    },
    // multi-series vertical bar; current default false; wiki says optional/off → asserted
    [ChartType.BarMulti]: {
      status: 'asserted',
      optionKey: 'valueLabels',
      target: false,
      rule: RULE_VALUE_LABELS,
    },
    // stacked horizontal bar; current default true (barHorizontalValueLabelsOpt); wiki is silent on stacked variant
    [ChartType.BarStacked]: {
      status: 'open',
      optionKey: 'valueLabels',
      current: true,
      notes: 'Wiki is silent on value labels for stacked bar specifically; default is inherited from horizontal bar (true) but stacking makes per-segment labels potentially noisy.',
    },
    // split bar panels; current default true (barHorizontalValueLabelsOpt); wiki is silent on split bar
    [ChartType.BarSplit]: {
      status: 'open',
      optionKey: 'valueLabels',
      current: true,
      notes: 'Wiki does not mention split bar charts; default is inherited from horizontal bar (true) but split layout may not always benefit from value labels.',
    },
    // grouped horizontal bars; current default true; same as horizontal bar → asserted
    [ChartType.BarGrouped]: {
      status: 'asserted',
      optionKey: 'valueLabels',
      target: true,
      rule: RULE_HANDBOOK_BAR_HORIZONTAL,
    },
    // stacked column; current default false; wiki is silent on stacked variant value labels
    [ChartType.ColumnStacked]: {
      status: 'open',
      optionKey: 'valueLabels',
      current: false,
      notes: 'Wiki is silent on value labels for column-stacked specifically; no wiki rule found prescribing on or off.',
    },
    // single-series line; current default false; wiki says label extremes only, off by default → asserted
    [ChartType.Line]: {
      status: 'asserted',
      optionKey: 'valueLabels',
      target: false,
      rule: RULE_VALUE_LABELS,
    },
    // multi-series line; current default false; wiki says off for line charts → asserted
    [ChartType.LineMulti]: {
      status: 'asserted',
      optionKey: 'valueLabels',
      target: false,
      rule: RULE_VALUE_LABELS,
    },
    // single-series area; current default false; wiki is silent on area value labels
    [ChartType.Area]: {
      status: 'open',
      optionKey: 'valueLabels',
      current: false,
      notes: 'Wiki covers area fills but does not prescribe a value label default for single-series area charts.',
    },
    // stacked area; valueLabels option is not registered for this chart
    [ChartType.AreaStacked]: { status: 'na', reason: 'valueLabels is not registered for area-stacked; interaction options use tooltips instead' },
    // donut; valueLabels option is not registered (uses showLabels/showValues/directLabelling instead)
    [ChartType.Donut]: { status: 'na', reason: 'donut uses showLabels/showValues arc options rather than the valueLabels boolean' },
    // pie; valueLabels option is not registered (uses showLabels/showValues/directLabelling instead)
    [ChartType.Pie]: { status: 'na', reason: 'pie uses showLabels/showValues arc options rather than the valueLabels boolean' },
  },

  // =========================================================================
  // Concern: AxisLabels
  // Primary verdict on 'horizontalLabelRotation'; notes cover verticalLabelPosition and horizontalLabelPosition
  // Concern does not apply to pie/donut (no axes)
  // =========================================================================
  [Concern.AxisLabels]: {
    // vertical bar; horizontalLabelRotation=Auto may allow rotation; wiki says never rotate
    [ChartType.BarVertical]: {
      status: 'todo',
      optionKey: 'horizontalLabelRotation',
      current: LabelRotation.Auto,
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
      notes: 'Wiki says never rotate axis labels; fix is to abbreviate or switch to horizontal bars. Auto mode may trigger rotation on long category labels — default should be Horizontal to enforce the no-rotation rule. verticalLabelPosition and horizontalLabelPosition both default to Auto (show when they fit); wiki prescribes label presence but not a specific LabelPosition enum value.',
    },
    // horizontal bar; horizontalLabelRotation=Auto; wiki says never rotate
    [ChartType.BarHorizontal]: {
      status: 'todo',
      optionKey: 'horizontalLabelRotation',
      current: LabelRotation.Auto,
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
      notes: 'Wiki says never rotate axis labels; horizontal bars are already the wiki-recommended fix for long category names, so rotation default of Horizontal is appropriate here too.',
    },
    // multi-series vertical bar; same rotation issue
    [ChartType.BarMulti]: {
      status: 'todo',
      optionKey: 'horizontalLabelRotation',
      current: LabelRotation.Auto,
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
      notes: 'Wiki says never rotate axis labels; Auto default may trigger rotation. Target is Horizontal.',
    },
    // stacked horizontal bar; same rotation issue
    [ChartType.BarStacked]: {
      status: 'todo',
      optionKey: 'horizontalLabelRotation',
      current: LabelRotation.Auto,
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
      notes: 'Wiki says never rotate axis labels; Auto default may trigger rotation. Target is Horizontal.',
    },
    // split bar panels; same rotation issue
    [ChartType.BarSplit]: {
      status: 'todo',
      optionKey: 'horizontalLabelRotation',
      current: LabelRotation.Auto,
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
      notes: 'Wiki says never rotate axis labels; Auto default may trigger rotation. Target is Horizontal.',
    },
    // grouped horizontal bars; same rotation issue
    [ChartType.BarGrouped]: {
      status: 'todo',
      optionKey: 'horizontalLabelRotation',
      current: LabelRotation.Auto,
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
      notes: 'Wiki says never rotate axis labels; Auto default may trigger rotation. Target is Horizontal.',
    },
    // stacked column; same rotation issue
    [ChartType.ColumnStacked]: {
      status: 'todo',
      optionKey: 'horizontalLabelRotation',
      current: LabelRotation.Auto,
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
      notes: 'Wiki says never rotate axis labels; Auto default may trigger rotation. Target is Horizontal.',
    },
    // single-series line; same rotation issue
    [ChartType.Line]: {
      status: 'todo',
      optionKey: 'horizontalLabelRotation',
      current: LabelRotation.Auto,
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
      notes: 'Wiki says never rotate axis labels. Target is Horizontal. verticalLabelPosition and horizontalLabelPosition both default to Auto; wiki is silent on the LabelPosition enum value.',
    },
    // multi-series line; same rotation issue
    [ChartType.LineMulti]: {
      status: 'todo',
      optionKey: 'horizontalLabelRotation',
      current: LabelRotation.Auto,
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
      notes: 'Wiki says never rotate axis labels. Target is Horizontal.',
    },
    // single-series area; same rotation issue
    [ChartType.Area]: {
      status: 'todo',
      optionKey: 'horizontalLabelRotation',
      current: LabelRotation.Auto,
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
      notes: 'Wiki says never rotate axis labels. Target is Horizontal.',
    },
    // stacked area; same rotation issue
    [ChartType.AreaStacked]: {
      status: 'todo',
      optionKey: 'horizontalLabelRotation',
      current: LabelRotation.Auto,
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
      notes: 'Wiki says never rotate axis labels. Target is Horizontal.',
    },
    // donut; no axes registered
    [ChartType.Donut]: { status: 'na', reason: 'donut is a polar chart with no Cartesian axes' },
    // pie; no axes registered
    [ChartType.Pie]: { status: 'na', reason: 'pie is a polar chart with no Cartesian axes' },
  },

  [Concern.Gridlines]: {},
  [Concern.Ticks]: {},
  [Concern.AxisLines]: {},
  [Concern.AxisScaleRange]: {},
  [Concern.ColorPalette]: {},
  [Concern.Crosshair]: {},
  [Concern.Tooltips]: {},
  [Concern.LineInterpolation]: {},
  [Concern.LineSymbols]: {},
  [Concern.BarLayout]: {},
  [Concern.PieDonutLayout]: {},
  [Concern.Stacking]: {},
  [Concern.Sort]: {},
  [Concern.RendererConstants]: {},
}
