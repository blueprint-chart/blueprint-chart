import { ChartType, DirectLabelMode, GridStyle, Interpolation, LabelRotation, ScaleType, SortDirection, SortMode, StackMode } from '../../enums'
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
const RULE_GRIDLINES_Y_AXIS = 'wiki/concepts/axes-and-grid-lines.md § Grid lines'
const RULE_TICKS_SUBTLE = 'wiki/concepts/axes-and-grid-lines.md § Tick marks'
const RULE_AXIS_ZERO_BAR = 'wiki/concepts/axes-and-grid-lines.md § Baseline rules'
const RULE_HANDBOOK_LINE = 'wiki/concepts/handbook-chart-types.md § Line Chart'
const RULE_HANDBOOK_AREA = 'wiki/concepts/handbook-chart-types.md § Area Chart'
const RULE_CROSSHAIR_PATTERNS = 'wiki/concepts/tooltips-and-interaction.md § Crosshair patterns'
const RULE_TOOLTIPS_HIDDEN = 'wiki/concepts/tooltips-and-interaction.md § Tooltip content'
const RULE_INTERPOLATION_MONOTONE = 'wiki/concepts/handbook-chart-types.md § Line Chart'
const RULE_ACCESSIBILITY_MULTIPLE_ENCODING = 'wiki/concepts/handbook-accessibility.md § Multiple encoding'
const RULE_BAR_SPACING = 'wiki/concepts/handbook-chart-types.md § Bar Chart (Vertical)'
const RULE_DONUT_CENTER = 'wiki/concepts/handbook-chart-types.md § Donut Chart'
const RULE_PIE_PERCENTAGE = 'wiki/concepts/handbook-chart-types.md § Pie Chart'
const RULE_STACKING_VARIANTS = 'wiki/concepts/handbook-chart-types.md § Stacked Bar Chart'
const RULE_SORT_DESCENDING = 'wiki/concepts/handbook-chart-types.md § Bar Chart (Vertical)'
const RULE_CVD_SAFE_PALETTE = 'wiki/concepts/handbook-color-and-palettes.md § Key rules'

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
    // multi-series bar; default Auto; wiki says direct labels preferred over legend → asserted
    [ChartType.BarMulti]: {
      status: 'asserted',
      optionKey: 'directLabelling',
      target: DirectLabelMode.Auto,
      rule: RULE_DIRECT_LABEL_PREFERRED,
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
    // donut; default Auto; wiki says "label each slice directly" → asserted
    [ChartType.Donut]: {
      status: 'asserted',
      optionKey: 'directLabelling',
      target: DirectLabelMode.Auto,
      rule: RULE_DIRECT_LABEL_PREFERRED,
    },
    // pie; default Auto; wiki says "label each slice directly" → asserted
    [ChartType.Pie]: {
      status: 'asserted',
      optionKey: 'directLabelling',
      target: DirectLabelMode.Auto,
      rule: RULE_DIRECT_LABEL_PREFERRED,
    },
  },

  // =========================================================================
  // Concern: Legend
  // optionKey verdict on 'legend' (boolean visibility); position/anchor are secondary.
  //
  // Phase 4 decision: 4 charts (BarMulti, Donut, Pie, LineMulti) get legend: false
  // because they ALSO get directLabelling: Auto. For the 5 stacked/split/grouped
  // charts the wiki is silent on a direct-labelling alternative, so the legend
  // stays true (asserted) — see docs/superpowers/plans/2026-05-10-chart-defaults-phase-4.md
  // Task 3 for rationale.
  // =========================================================================
  [Concern.Legend]: {
    // single-series; legend option is not registered for this chart
    [ChartType.BarVertical]: { status: 'na', reason: 'single-series vertical bar; legend option is not registered' },
    // single-series; legend option is not registered for this chart
    [ChartType.BarHorizontal]: { status: 'na', reason: 'single-series horizontal bar; legend option is not registered' },
    // multi-series bar; default false; wiki says legend is a fallback not the primary default → asserted
    [ChartType.BarMulti]: {
      status: 'asserted',
      optionKey: 'legend',
      target: false,
      rule: RULE_WHEN_TO_USE_LEGENDS,
    },
    [ChartType.BarStacked]: {
      status: 'asserted',
      optionKey: 'legend',
      target: true,
      rule: RULE_WHEN_TO_USE_LEGENDS,
    },
    [ChartType.BarSplit]: {
      status: 'asserted',
      optionKey: 'legend',
      target: true,
      rule: RULE_WHEN_TO_USE_LEGENDS,
    },
    [ChartType.BarGrouped]: {
      status: 'asserted',
      optionKey: 'legend',
      target: true,
      rule: RULE_WHEN_TO_USE_LEGENDS,
    },
    [ChartType.ColumnStacked]: {
      status: 'asserted',
      optionKey: 'legend',
      target: true,
      rule: RULE_WHEN_TO_USE_LEGENDS,
    },
    // single-series; legend option is not registered for this chart
    [ChartType.Line]: { status: 'na', reason: 'single-series line; legend option is not registered' },
    // multi-line; default false; wiki says prefer direct end-of-line labels over a legend → asserted
    [ChartType.LineMulti]: {
      status: 'asserted',
      optionKey: 'legend',
      target: false,
      rule: RULE_WHEN_TO_USE_LEGENDS,
    },
    // single-series; legend option is not registered for this chart
    [ChartType.Area]: { status: 'na', reason: 'single-series area; legend option is not registered' },
    [ChartType.AreaStacked]: {
      status: 'asserted',
      optionKey: 'legend',
      target: true,
      rule: RULE_WHEN_TO_USE_LEGENDS,
    },
    // donut; default false; wiki says direct slice labels are the default → asserted
    [ChartType.Donut]: {
      status: 'asserted',
      optionKey: 'legend',
      target: false,
      rule: RULE_WHEN_TO_USE_LEGENDS,
    },
    // pie; default false; wiki says direct slice labels are the default → asserted
    [ChartType.Pie]: {
      status: 'asserted',
      optionKey: 'legend',
      target: false,
      rule: RULE_WHEN_TO_USE_LEGENDS,
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
    [ChartType.BarVertical]: {
      status: 'asserted',
      optionKey: 'horizontalLabelRotation',
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
    },
    [ChartType.BarHorizontal]: {
      status: 'asserted',
      optionKey: 'horizontalLabelRotation',
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
    },
    [ChartType.BarMulti]: {
      status: 'asserted',
      optionKey: 'horizontalLabelRotation',
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
    },
    [ChartType.BarStacked]: {
      status: 'asserted',
      optionKey: 'horizontalLabelRotation',
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
    },
    [ChartType.BarSplit]: {
      status: 'asserted',
      optionKey: 'horizontalLabelRotation',
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
    },
    [ChartType.BarGrouped]: {
      status: 'asserted',
      optionKey: 'horizontalLabelRotation',
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
    },
    [ChartType.ColumnStacked]: {
      status: 'asserted',
      optionKey: 'horizontalLabelRotation',
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
    },
    [ChartType.Line]: {
      status: 'asserted',
      optionKey: 'horizontalLabelRotation',
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
    },
    [ChartType.LineMulti]: {
      status: 'asserted',
      optionKey: 'horizontalLabelRotation',
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
    },
    [ChartType.Area]: {
      status: 'asserted',
      optionKey: 'horizontalLabelRotation',
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
    },
    [ChartType.AreaStacked]: {
      status: 'asserted',
      optionKey: 'horizontalLabelRotation',
      target: LabelRotation.Horizontal,
      rule: RULE_NEVER_ROTATE,
    },
    // donut; no axes registered
    [ChartType.Donut]: { status: 'na', reason: 'donut is a polar chart with no Cartesian axes' },
    // pie; no axes registered
    [ChartType.Pie]: { status: 'na', reason: 'pie is a polar chart with no Cartesian axes' },
  },

  // =========================================================================
  // Concern: Gridlines
  // Primary verdict on the value-axis grid style (the side where grid lines aid reading).
  // Wiki: y-axis grid on (dashed), x-axis grid off.
  // For horizontal bar family the value axis is horizontal, so horizontalGridStyle is the
  // load-bearing key; for all other chart types verticalGridStyle is the load-bearing key.
  // =========================================================================
  [Concern.Gridlines]: {
    // vertical bar; verticalGridStyle=Dashed (value axis), horizontalGridStyle=None → asserted
    [ChartType.BarVertical]: {
      status: 'asserted',
      optionKey: 'verticalGridStyle',
      target: GridStyle.Dashed,
      rule: RULE_GRIDLINES_Y_AXIS,
    },
    // horizontal bar; horizontalGridStyle=Dashed (value axis), verticalGridStyle=None → asserted
    [ChartType.BarHorizontal]: {
      status: 'asserted',
      optionKey: 'horizontalGridStyle',
      target: GridStyle.Dashed,
      rule: RULE_GRIDLINES_Y_AXIS,
    },
    // multi-series vertical bar; same axis opts as barVertical → asserted
    [ChartType.BarMulti]: {
      status: 'asserted',
      optionKey: 'verticalGridStyle',
      target: GridStyle.Dashed,
      rule: RULE_GRIDLINES_Y_AXIS,
    },
    // stacked horizontal bar; horizontalGridStyle=Dashed (value axis) → asserted
    [ChartType.BarStacked]: {
      status: 'asserted',
      optionKey: 'horizontalGridStyle',
      target: GridStyle.Dashed,
      rule: RULE_GRIDLINES_Y_AXIS,
    },
    // split bar; horizontalGridStyle=Dashed (value axis) → asserted
    [ChartType.BarSplit]: {
      status: 'asserted',
      optionKey: 'horizontalGridStyle',
      target: GridStyle.Dashed,
      rule: RULE_GRIDLINES_Y_AXIS,
    },
    // grouped horizontal bars; horizontalGridStyle=Dashed (value axis) → asserted
    [ChartType.BarGrouped]: {
      status: 'asserted',
      optionKey: 'horizontalGridStyle',
      target: GridStyle.Dashed,
      rule: RULE_GRIDLINES_Y_AXIS,
    },
    // stacked column; same axis opts as barVertical → asserted
    [ChartType.ColumnStacked]: {
      status: 'asserted',
      optionKey: 'verticalGridStyle',
      target: GridStyle.Dashed,
      rule: RULE_GRIDLINES_Y_AXIS,
    },
    // single-series line; verticalGridStyle=Dashed (value axis), horizontalGridStyle=None → asserted
    [ChartType.Line]: {
      status: 'asserted',
      optionKey: 'verticalGridStyle',
      target: GridStyle.Dashed,
      rule: RULE_GRIDLINES_Y_AXIS,
    },
    // multi-series line; same axis opts as line → asserted
    [ChartType.LineMulti]: {
      status: 'asserted',
      optionKey: 'verticalGridStyle',
      target: GridStyle.Dashed,
      rule: RULE_GRIDLINES_Y_AXIS,
    },
    // single-series area; same axis opts as line → asserted
    [ChartType.Area]: {
      status: 'asserted',
      optionKey: 'verticalGridStyle',
      target: GridStyle.Dashed,
      rule: RULE_GRIDLINES_Y_AXIS,
    },
    // stacked area; same axis opts as line (areaStackedAxisOpts) → asserted
    [ChartType.AreaStacked]: {
      status: 'asserted',
      optionKey: 'verticalGridStyle',
      target: GridStyle.Dashed,
      rule: RULE_GRIDLINES_Y_AXIS,
    },
    // donut; polar chart — no Cartesian axes
    [ChartType.Donut]: { status: 'na', reason: 'donut is a polar chart with no Cartesian axes; gridline concern does not apply' },
    // pie; polar chart — no Cartesian axes
    [ChartType.Pie]: { status: 'na', reason: 'pie is a polar chart with no Cartesian axes; gridline concern does not apply' },
  },

  // =========================================================================
  // Concern: Ticks
  // Primary verdict on the value-axis tick visibility.
  // Wiki: "subtle or no ticks are preferred" → hidden is the correct default.
  // All audited chart types default both tick options to false (from axisOpts).
  // =========================================================================
  [Concern.Ticks]: {
    // vertical bar; showVerticalTicks=false (value-axis ticks) → asserted
    [ChartType.BarVertical]: {
      status: 'asserted',
      optionKey: 'showVerticalTicks',
      target: false,
      rule: RULE_TICKS_SUBTLE,
    },
    // horizontal bar; showHorizontalTicks=false (value-axis ticks) → asserted
    [ChartType.BarHorizontal]: {
      status: 'asserted',
      optionKey: 'showHorizontalTicks',
      target: false,
      rule: RULE_TICKS_SUBTLE,
    },
    // multi-series vertical bar; showVerticalTicks=false → asserted
    [ChartType.BarMulti]: {
      status: 'asserted',
      optionKey: 'showVerticalTicks',
      target: false,
      rule: RULE_TICKS_SUBTLE,
    },
    // stacked horizontal bar; showHorizontalTicks=false (value-axis) → asserted
    [ChartType.BarStacked]: {
      status: 'asserted',
      optionKey: 'showHorizontalTicks',
      target: false,
      rule: RULE_TICKS_SUBTLE,
    },
    // split bar; showHorizontalTicks=false (value-axis) → asserted
    [ChartType.BarSplit]: {
      status: 'asserted',
      optionKey: 'showHorizontalTicks',
      target: false,
      rule: RULE_TICKS_SUBTLE,
    },
    // grouped horizontal bars; showHorizontalTicks=false (value-axis) → asserted
    [ChartType.BarGrouped]: {
      status: 'asserted',
      optionKey: 'showHorizontalTicks',
      target: false,
      rule: RULE_TICKS_SUBTLE,
    },
    // stacked column; showVerticalTicks=false (value-axis) → asserted
    [ChartType.ColumnStacked]: {
      status: 'asserted',
      optionKey: 'showVerticalTicks',
      target: false,
      rule: RULE_TICKS_SUBTLE,
    },
    // single-series line; showVerticalTicks=false (value-axis) → asserted
    [ChartType.Line]: {
      status: 'asserted',
      optionKey: 'showVerticalTicks',
      target: false,
      rule: RULE_TICKS_SUBTLE,
    },
    // multi-series line; showVerticalTicks=false → asserted
    [ChartType.LineMulti]: {
      status: 'asserted',
      optionKey: 'showVerticalTicks',
      target: false,
      rule: RULE_TICKS_SUBTLE,
    },
    // single-series area; showVerticalTicks=false → asserted
    [ChartType.Area]: {
      status: 'asserted',
      optionKey: 'showVerticalTicks',
      target: false,
      rule: RULE_TICKS_SUBTLE,
    },
    // stacked area; showVerticalTicks=false → asserted
    [ChartType.AreaStacked]: {
      status: 'asserted',
      optionKey: 'showVerticalTicks',
      target: false,
      rule: RULE_TICKS_SUBTLE,
    },
    // donut; polar chart — no Cartesian axes
    [ChartType.Donut]: { status: 'na', reason: 'donut is a polar chart with no Cartesian axes; tick concern does not apply' },
    // pie; polar chart — no Cartesian axes
    [ChartType.Pie]: { status: 'na', reason: 'pie is a polar chart with no Cartesian axes; tick concern does not apply' },
  },

  // =========================================================================
  // Concern: AxisLines
  // Primary verdict on 'showVerticalAxis' (the value-axis line for vertical bar/line family)
  // or 'showHorizontalAxis' (the value-axis line for horizontal bar family).
  // Wiki says axis lines should be "grey and minimal" but does not mandate show vs. hide.
  // Cells are 'open' — wiki describes styling but is silent on on/off defaults.
  // Exception: for the vertical bar/line family, showVerticalAxis=false is a registered
  // non-default choice that deviates from the generic axisOpts default of true;
  // the wiki does not explicitly endorse hiding it, so this cell is 'open' pending
  // a wiki clarification rather than 'asserted'.
  // =========================================================================
  [Concern.AxisLines]: {
    // vertical bar; showVerticalAxis=false (value-axis line hidden), showHorizontalAxis=true
    [ChartType.BarVertical]: {
      status: 'open',
      optionKey: 'showVerticalAxis',
      current: false,
      notes: 'Registry hides the vertical (value) axis line. Wiki says axis lines should be grey/minimal but does not prescribe show vs. hide. No wiki rule found mandating hidden; no rule found mandating shown. showHorizontalAxis defaults to true.',
    },
    // horizontal bar; showVerticalAxis=true (category-axis line shown), showHorizontalAxis=true
    [ChartType.BarHorizontal]: {
      status: 'open',
      optionKey: 'showHorizontalAxis',
      current: true,
      notes: 'Both axis lines default to true for horizontal bar. Wiki is silent on whether the horizontal (value) axis line should be shown or hidden. No wiki rule found.',
    },
    // multi-series vertical bar; showVerticalAxis=false, showHorizontalAxis=true
    [ChartType.BarMulti]: {
      status: 'open',
      optionKey: 'showVerticalAxis',
      current: false,
      notes: 'Same as barVertical: registry hides the vertical axis line. Wiki is silent on show vs. hide.',
    },
    // stacked horizontal bar; showVerticalAxis=true, showHorizontalAxis=true
    [ChartType.BarStacked]: {
      status: 'open',
      optionKey: 'showHorizontalAxis',
      current: true,
      notes: 'Both axis lines default to true for horizontal bar family. Wiki is silent on show vs. hide.',
    },
    // split bar; showVerticalAxis=true, showHorizontalAxis=true
    [ChartType.BarSplit]: {
      status: 'open',
      optionKey: 'showHorizontalAxis',
      current: true,
      notes: 'Both axis lines default to true for horizontal bar family. Wiki is silent on show vs. hide.',
    },
    // grouped horizontal bars; showVerticalAxis=true, showHorizontalAxis=true
    [ChartType.BarGrouped]: {
      status: 'open',
      optionKey: 'showHorizontalAxis',
      current: true,
      notes: 'Both axis lines default to true for horizontal bar family. Wiki is silent on show vs. hide.',
    },
    // stacked column; showVerticalAxis=false, showHorizontalAxis=true
    [ChartType.ColumnStacked]: {
      status: 'open',
      optionKey: 'showVerticalAxis',
      current: false,
      notes: 'Same as barVertical: registry hides the vertical axis line. Wiki is silent on show vs. hide.',
    },
    // single-series line; showVerticalAxis=false, showHorizontalAxis=true
    [ChartType.Line]: {
      status: 'open',
      optionKey: 'showVerticalAxis',
      current: false,
      notes: 'Registry hides the vertical (value) axis line. Wiki says axis lines should be grey/minimal but does not prescribe show vs. hide for line charts.',
    },
    // multi-series line; showVerticalAxis=false, showHorizontalAxis=true
    [ChartType.LineMulti]: {
      status: 'open',
      optionKey: 'showVerticalAxis',
      current: false,
      notes: 'Same as line: registry hides the vertical axis line. Wiki is silent on show vs. hide.',
    },
    // single-series area; showVerticalAxis=false, showHorizontalAxis=true
    [ChartType.Area]: {
      status: 'open',
      optionKey: 'showVerticalAxis',
      current: false,
      notes: 'Same as line: registry hides the vertical axis line. Wiki is silent on show vs. hide for area charts.',
    },
    // stacked area; showVerticalAxis=false, showHorizontalAxis=true
    [ChartType.AreaStacked]: {
      status: 'open',
      optionKey: 'showVerticalAxis',
      current: false,
      notes: 'Same as line/area: registry hides the vertical axis line. Wiki is silent on show vs. hide.',
    },
    // donut; polar chart — no Cartesian axes
    [ChartType.Donut]: { status: 'na', reason: 'donut is a polar chart with no Cartesian axes; axis-line concern does not apply' },
    // pie; polar chart — no Cartesian axes
    [ChartType.Pie]: { status: 'na', reason: 'pie is a polar chart with no Cartesian axes; axis-line concern does not apply' },
  },

  // =========================================================================
  // Concern: AxisScaleRange
  // Primary verdict on scale type and zero-baseline policy.
  // Wiki: bar/area family MUST start at zero (verticalRangeMin / horizontalRangeMin = 0);
  //       line charts do NOT need to start at zero (auto is appropriate).
  // Registry: verticalRangeMin / horizontalRangeMin have no default (placeholder 'auto').
  // Scale type defaults to ScaleType.Linear wherever registered — wiki says log is opt-in.
  // =========================================================================
  [Concern.AxisScaleRange]: {
    // vertical bar; verticalRangeMin default=0 → asserted
    [ChartType.BarVertical]: {
      status: 'asserted',
      optionKey: 'verticalRangeMin',
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
    },
    // horizontal bar; horizontalRangeMin default=0 → asserted
    [ChartType.BarHorizontal]: {
      status: 'asserted',
      optionKey: 'horizontalRangeMin',
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
    },
    // multi-series vertical bar; verticalRangeMin default=0 → asserted
    [ChartType.BarMulti]: {
      status: 'asserted',
      optionKey: 'verticalRangeMin',
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
    },
    // stacked horizontal bar; horizontalRangeMin default=0 → asserted
    [ChartType.BarStacked]: {
      status: 'asserted',
      optionKey: 'horizontalRangeMin',
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
    },
    // split bar; horizontalRangeMin default=0 → asserted
    [ChartType.BarSplit]: {
      status: 'asserted',
      optionKey: 'horizontalRangeMin',
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
    },
    // grouped horizontal bars; horizontalRangeMin default=0 → asserted
    [ChartType.BarGrouped]: {
      status: 'asserted',
      optionKey: 'horizontalRangeMin',
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
    },
    // stacked column; verticalRangeMin default=0 → asserted
    [ChartType.ColumnStacked]: {
      status: 'asserted',
      optionKey: 'verticalRangeMin',
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
    },
    // single-series line; verticalRangeMin has no default (auto) → asserted (auto is correct per wiki)
    [ChartType.Line]: {
      status: 'asserted',
      optionKey: 'verticalScaleType',
      target: ScaleType.Linear,
      rule: RULE_HANDBOOK_LINE,
    },
    // multi-series line; same as line → asserted
    [ChartType.LineMulti]: {
      status: 'asserted',
      optionKey: 'verticalScaleType',
      target: ScaleType.Linear,
      rule: RULE_HANDBOOK_LINE,
    },
    // single-series area; verticalRangeMin default=0 → asserted
    [ChartType.Area]: {
      status: 'asserted',
      optionKey: 'verticalRangeMin',
      target: 0,
      rule: RULE_HANDBOOK_AREA,
    },
    // stacked area; verticalRangeMin default=0 → asserted
    [ChartType.AreaStacked]: {
      status: 'asserted',
      optionKey: 'verticalRangeMin',
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
    },
    // donut; polar chart — no scale range concern
    [ChartType.Donut]: { status: 'na', reason: 'donut is a polar chart with no Cartesian axes; scale range concern does not apply' },
    // pie; polar chart — no scale range concern
    [ChartType.Pie]: { status: 'na', reason: 'pie is a polar chart with no Cartesian axes; scale range concern does not apply' },
  },
  // =========================================================================
  // Concern: ColorPalette
  // Primary verdict on 'colorPalette' (default 'Blueprint' per paletteOpt).
  // All 13 chart types register paletteOpt / colorsOpt so no chart is 'na'.
  // Wiki prescribes CVD-safe, max-7, no-rainbow, perceptually-uniform palettes
  // but does NOT name a specific palette identifier — the 'Blueprint' default
  // can only be checked against properties, not a prescribed name.
  // autoContrast (default false) and allowDarkMode (default true) are secondary.
  // =========================================================================
  [Concern.ColorPalette]: {
    // vertical bar; colorPalette='Blueprint'; wiki says CVD-safe categorical palette by default
    [ChartType.BarVertical]: {
      status: 'open',
      optionKey: 'colorPalette',
      current: 'Blueprint',
      notes: 'Wiki prescribes a CVD-safe, max-7, no-rainbow, perceptually-uniform categorical palette but does not name a specific identifier. The "Blueprint" palette cannot be evaluated without inspecting its color values against CVD and grayscale distinguishability criteria. autoContrast=false and allowDarkMode=true are secondary; wiki notes dark mode may need slightly increased saturation (allowDarkMode=true is appropriate). No wiki rule names a target identifier.',
    },
    // horizontal bar; same as vertical bar
    [ChartType.BarHorizontal]: {
      status: 'open',
      optionKey: 'colorPalette',
      current: 'Blueprint',
      notes: 'Same as barVertical: wiki prescribes palette properties (CVD-safe, max 7, no rainbow) but does not name a specific default palette. autoContrast=false, allowDarkMode=true are secondary and consistent with wiki guidance.',
    },
    // multi-series bar; wiki prescribes categorical palette for multi-series bar
    [ChartType.BarMulti]: {
      status: 'open',
      optionKey: 'colorPalette',
      current: 'Blueprint',
      notes: 'Multi-series bar is the primary use case for the categorical palette. Wiki: max 7 colors before confusion, blue-orange safest for CVD, grey to de-emphasize. Blueprint palette must be verified against these properties; no identifier prescribed.',
    },
    // stacked horizontal bar; same categorical palette concern
    [ChartType.BarStacked]: {
      status: 'open',
      optionKey: 'colorPalette',
      current: 'Blueprint',
      notes: 'Stacked bar is a categorical multi-series chart. Wiki requires CVD-safe categorical palette. No specific identifier named by wiki.',
    },
    // split bar panels; same categorical palette concern
    [ChartType.BarSplit]: {
      status: 'open',
      optionKey: 'colorPalette',
      current: 'Blueprint',
      notes: 'Split bar renders each series in its own panel. Wiki requires categorical palette; no specific identifier named.',
    },
    // grouped horizontal bars; same categorical palette concern
    [ChartType.BarGrouped]: {
      status: 'open',
      optionKey: 'colorPalette',
      current: 'Blueprint',
      notes: 'Grouped bar is a multi-series categorical chart. Wiki: max 7 colors, CVD-safe. No palette identifier prescribed.',
    },
    // stacked column; same as stacked bar
    [ChartType.ColumnStacked]: {
      status: 'open',
      optionKey: 'colorPalette',
      current: 'Blueprint',
      notes: 'Stacked column is categorical multi-series. Wiki requires CVD-safe categorical palette; no specific identifier named.',
    },
    // single-series line; categorical palette still applies; single color drawn from first slot
    [ChartType.Line]: {
      status: 'open',
      optionKey: 'colorPalette',
      current: 'Blueprint',
      notes: 'Single-series line uses the first color of the categorical palette. Wiki: "start with grey" principle suggests the first palette slot should be a meaningful, non-grey color for single-series use. No identifier prescribed by wiki.',
    },
    // multi-series line; categorical palette, wiki says max 7 and CVD-safe
    [ChartType.LineMulti]: {
      status: 'open',
      optionKey: 'colorPalette',
      current: 'Blueprint',
      notes: 'Multi-line uses categorical palette. Wiki: max 7 colors, blue-orange as safest combination for two-series charts, CVD-safe. No specific identifier named.',
    },
    // single-series area; same as single-series line
    [ChartType.Area]: {
      status: 'open',
      optionKey: 'colorPalette',
      current: 'Blueprint',
      notes: 'Single-series area uses the first color of the categorical palette. Same palette property requirements as line; no identifier prescribed.',
    },
    // stacked area; categorical palette, same requirements
    [ChartType.AreaStacked]: {
      status: 'open',
      optionKey: 'colorPalette',
      current: 'Blueprint',
      notes: 'Stacked area uses categorical palette for multiple series. Wiki: max 7 colors, CVD-safe, no rainbow. No identifier named.',
    },
    // donut; categorical palette for slices
    [ChartType.Donut]: {
      status: 'open',
      optionKey: 'colorPalette',
      current: 'Blueprint',
      notes: 'Donut slices use categorical palette. Wiki: max 7 slices, highlight key slice with saturated color and grey the rest. autoContrast=false; wiki does not prescribe contrast-adjustment default. No palette identifier named by wiki.',
    },
    // pie; categorical palette for slices
    [ChartType.Pie]: {
      status: 'open',
      optionKey: 'colorPalette',
      current: 'Blueprint',
      notes: 'Pie slices use categorical palette. Wiki: max 7 slices (pie slice max in registry is 5 per pieSliceMaxOpt), highlight key slice and grey the rest. No palette identifier named by wiki.',
    },
  },

  // =========================================================================
  // Concern: Crosshair
  // Primary verdict on 'crosshair' (default false).
  // Cartesian charts: all audited types except donut and pie register crosshairOpts
  //   or lineCrosshairOpts. Donut/Pie have no crosshair option → 'na'.
  // Wiki: vertical crosshair is standard for time-series line/area; bar charts
  //   are not mentioned. Current default is false for all chart types.
  // Secondary: crosshairDirection (Both for bar family, Vertical for line/area
  //   via lineCrosshairDirectionOpt), crosshairStyle=Dashed (matches wiki), crosshairColor='#999'.
  // =========================================================================
  [Concern.Crosshair]: {
    // vertical bar; crosshair=false; wiki is silent on whether bar charts should have a crosshair
    [ChartType.BarVertical]: {
      status: 'open',
      optionKey: 'crosshair',
      current: false,
      notes: 'Wiki mentions crosshair only for time-series line/area and scatter; no rule found for vertical bar. crosshairDirection defaults to Both (neither direction is prescribed). crosshairStyle=Dashed and crosshairColor=#999 match the wiki prescription for subtle/dashed/grey. Current off default is reasonable but wiki does not mandate it.',
    },
    // horizontal bar; same wiki gap as vertical bar
    [ChartType.BarHorizontal]: {
      status: 'open',
      optionKey: 'crosshair',
      current: false,
      notes: 'Wiki does not mention crosshair for horizontal bar charts. crosshairDirection=Both is unspecified by wiki. crosshairStyle=Dashed, crosshairColor=#999 match wiki styling prescription. No wiki rule found for on/off default.',
    },
    // multi-series bar; wiki silent on bar crosshair
    [ChartType.BarMulti]: {
      status: 'open',
      optionKey: 'crosshair',
      current: false,
      notes: 'Wiki does not prescribe crosshair behavior for multi-series vertical bar. No wiki rule found for on/off default.',
    },
    // stacked horizontal bar; wiki silent
    [ChartType.BarStacked]: {
      status: 'open',
      optionKey: 'crosshair',
      current: false,
      notes: 'Wiki does not prescribe crosshair behavior for stacked horizontal bar. No wiki rule found.',
    },
    // split bar; wiki silent
    [ChartType.BarSplit]: {
      status: 'open',
      optionKey: 'crosshair',
      current: false,
      notes: 'Wiki does not prescribe crosshair behavior for split bar panels. No wiki rule found.',
    },
    // grouped horizontal bars; wiki silent
    [ChartType.BarGrouped]: {
      status: 'open',
      optionKey: 'crosshair',
      current: false,
      notes: 'Wiki does not prescribe crosshair behavior for grouped horizontal bars. No wiki rule found.',
    },
    // stacked column; wiki silent on bar crosshair
    [ChartType.ColumnStacked]: {
      status: 'open',
      optionKey: 'crosshair',
      current: false,
      notes: 'Wiki does not prescribe crosshair behavior for stacked column. No wiki rule found.',
    },
    // single-series line; crosshair=false; wiki says vertical crosshair is standard for time-series
    [ChartType.Line]: {
      status: 'asserted',
      optionKey: 'crosshair',
      target: true,
      rule: RULE_CROSSHAIR_PATTERNS,
    },
    // multi-series line; same wiki rule applies — vertical crosshair standard for line charts
    [ChartType.LineMulti]: {
      status: 'asserted',
      optionKey: 'crosshair',
      target: true,
      rule: RULE_CROSSHAIR_PATTERNS,
    },
    // single-series area; wiki says vertical crosshair for time-series area charts
    [ChartType.Area]: {
      status: 'asserted',
      optionKey: 'crosshair',
      target: true,
      rule: RULE_CROSSHAIR_PATTERNS,
    },
    // stacked area; same as area — wiki prescribes vertical crosshair for time-series area
    [ChartType.AreaStacked]: {
      status: 'asserted',
      optionKey: 'crosshair',
      target: true,
      rule: RULE_CROSSHAIR_PATTERNS,
    },
    // donut; no crosshair option registered
    [ChartType.Donut]: { status: 'na', reason: 'donut is a polar chart; crosshair option is not registered for this chart type' },
    // pie; no crosshair option registered
    [ChartType.Pie]: { status: 'na', reason: 'pie is a polar chart; crosshair option is not registered for this chart type' },
  },

  // =========================================================================
  // Concern: Tooltips
  // Primary verdict on 'tooltips' (default false across all chart types).
  // All 13 audited chart types register tooltipsOpt → all are in scope (no 'na').
  // Wiki: "Tooltips are hidden by default" — the current false default matches.
  // Secondary: tooltip content, positioning, keyboard accessibility are design
  // constraints once tooltips are enabled; they do not affect the on/off default.
  // =========================================================================
  [Concern.Tooltips]: {
    // vertical bar; tooltips=false; wiki says "hidden by default" → asserted
    [ChartType.BarVertical]: {
      status: 'asserted',
      optionKey: 'tooltips',
      target: false,
      rule: RULE_TOOLTIPS_HIDDEN,
    },
    // horizontal bar; tooltips=false → asserted
    [ChartType.BarHorizontal]: {
      status: 'asserted',
      optionKey: 'tooltips',
      target: false,
      rule: RULE_TOOLTIPS_HIDDEN,
    },
    // multi-series bar; tooltips=false → asserted
    [ChartType.BarMulti]: {
      status: 'asserted',
      optionKey: 'tooltips',
      target: false,
      rule: RULE_TOOLTIPS_HIDDEN,
    },
    // stacked horizontal bar; tooltips=false → asserted
    [ChartType.BarStacked]: {
      status: 'asserted',
      optionKey: 'tooltips',
      target: false,
      rule: RULE_TOOLTIPS_HIDDEN,
    },
    // split bar; tooltips=false → asserted
    [ChartType.BarSplit]: {
      status: 'asserted',
      optionKey: 'tooltips',
      target: false,
      rule: RULE_TOOLTIPS_HIDDEN,
    },
    // grouped horizontal bars; tooltips=false → asserted
    [ChartType.BarGrouped]: {
      status: 'asserted',
      optionKey: 'tooltips',
      target: false,
      rule: RULE_TOOLTIPS_HIDDEN,
    },
    // stacked column; tooltips=false → asserted
    [ChartType.ColumnStacked]: {
      status: 'asserted',
      optionKey: 'tooltips',
      target: false,
      rule: RULE_TOOLTIPS_HIDDEN,
    },
    // single-series line; tooltips=false → asserted
    [ChartType.Line]: {
      status: 'asserted',
      optionKey: 'tooltips',
      target: false,
      rule: RULE_TOOLTIPS_HIDDEN,
    },
    // multi-series line; tooltips=false → asserted
    [ChartType.LineMulti]: {
      status: 'asserted',
      optionKey: 'tooltips',
      target: false,
      rule: RULE_TOOLTIPS_HIDDEN,
    },
    // single-series area; tooltips=false → asserted
    [ChartType.Area]: {
      status: 'asserted',
      optionKey: 'tooltips',
      target: false,
      rule: RULE_TOOLTIPS_HIDDEN,
    },
    // stacked area; tooltips=false → asserted
    [ChartType.AreaStacked]: {
      status: 'asserted',
      optionKey: 'tooltips',
      target: false,
      rule: RULE_TOOLTIPS_HIDDEN,
    },
    // donut; tooltips=false → asserted (donut registers tooltipsOpt directly)
    [ChartType.Donut]: {
      status: 'asserted',
      optionKey: 'tooltips',
      target: false,
      rule: RULE_TOOLTIPS_HIDDEN,
    },
    // pie; tooltips=false → asserted (pie registers tooltipsOpt directly)
    [ChartType.Pie]: {
      status: 'asserted',
      optionKey: 'tooltips',
      target: false,
      rule: RULE_TOOLTIPS_HIDDEN,
    },
  },
  // =========================================================================
  // Concern: LineInterpolation
  // Primary verdict on 'interpolation'.
  // Applies only to Line, LineMulti, Area, AreaStacked — all registered with
  // lineInterpolationOpt (default MonotoneX). All other chart types use no
  // interpolation option and are na.
  // Wiki: monotone is the preferred general default (smooth, non-distorting).
  // =========================================================================
  [Concern.LineInterpolation]: {
    // vertical bar — no interpolation; not a line/area chart
    [ChartType.BarVertical]: { status: 'na', reason: 'not a line or area chart; interpolation does not apply' },
    // horizontal bar — not a line/area chart
    [ChartType.BarHorizontal]: { status: 'na', reason: 'not a line or area chart; interpolation does not apply' },
    // multi-series vertical bar — not a line/area chart
    [ChartType.BarMulti]: { status: 'na', reason: 'not a line or area chart; interpolation does not apply' },
    // stacked horizontal bar — not a line/area chart
    [ChartType.BarStacked]: { status: 'na', reason: 'not a line or area chart; interpolation does not apply' },
    // split bar — not a line/area chart
    [ChartType.BarSplit]: { status: 'na', reason: 'not a line or area chart; interpolation does not apply' },
    // grouped horizontal bars — not a line/area chart
    [ChartType.BarGrouped]: { status: 'na', reason: 'not a line or area chart; interpolation does not apply' },
    // stacked column — not a line/area chart
    [ChartType.ColumnStacked]: { status: 'na', reason: 'not a line or area chart; interpolation does not apply' },
    // single-series line; lineInterpolationOpt sets default=MonotoneX; wiki says monotone is preferred → asserted
    [ChartType.Line]: {
      status: 'asserted',
      optionKey: 'interpolation',
      target: Interpolation.MonotoneX,
      rule: RULE_INTERPOLATION_MONOTONE,
    },
    // multi-series line; same lineInterpolationOpt → asserted
    [ChartType.LineMulti]: {
      status: 'asserted',
      optionKey: 'interpolation',
      target: Interpolation.MonotoneX,
      rule: RULE_INTERPOLATION_MONOTONE,
    },
    // single-series area; lineInterpolationOpt sets default=MonotoneX; wiki does not explicitly cover area
    // but monotone is the registered default and is safe — asserted as consistent with the line rule
    [ChartType.Area]: {
      status: 'asserted',
      optionKey: 'interpolation',
      target: Interpolation.MonotoneX,
      rule: RULE_INTERPOLATION_MONOTONE,
    },
    // stacked area; lineInterpolationOpt sets default=MonotoneX; same reasoning as Area → asserted
    [ChartType.AreaStacked]: {
      status: 'asserted',
      optionKey: 'interpolation',
      target: Interpolation.MonotoneX,
      rule: RULE_INTERPOLATION_MONOTONE,
    },
    // donut — polar chart; no interpolation
    [ChartType.Donut]: { status: 'na', reason: 'polar chart; interpolation does not apply' },
    // pie — polar chart; no interpolation
    [ChartType.Pie]: { status: 'na', reason: 'polar chart; interpolation does not apply' },
  },

  // =========================================================================
  // Concern: LineSymbols
  // Primary verdict on 'lineSymbols' (default false).
  // Applies to Line, LineMulti, Area — all include ...lineSymbolOpts.
  // AreaStacked registers ...lineCrosshairOpts but NOT ...lineOpts / ...lineSymbolOpts → na.
  // Wiki: accessibility rule argues for symbols as a second encoding channel.
  // For multi-line the argument is strongest; for single-series line/area the wiki
  // is less explicit. lineSymbolShape/ShowOn/Style/Size/Opacity defaults are secondary.
  // =========================================================================
  [Concern.LineSymbols]: {
    // vertical bar — no line symbol options registered
    [ChartType.BarVertical]: { status: 'na', reason: 'not a line or area chart; lineSymbols option is not registered' },
    // horizontal bar — no line symbol options registered
    [ChartType.BarHorizontal]: { status: 'na', reason: 'not a line or area chart; lineSymbols option is not registered' },
    // multi-series bar — no line symbol options registered
    [ChartType.BarMulti]: { status: 'na', reason: 'not a line or area chart; lineSymbols option is not registered' },
    // stacked horizontal bar — no line symbol options registered
    [ChartType.BarStacked]: { status: 'na', reason: 'not a line or area chart; lineSymbols option is not registered' },
    // split bar — no line symbol options registered
    [ChartType.BarSplit]: { status: 'na', reason: 'not a line or area chart; lineSymbols option is not registered' },
    // grouped horizontal bars — no line symbol options registered
    [ChartType.BarGrouped]: { status: 'na', reason: 'not a line or area chart; lineSymbols option is not registered' },
    // stacked column — no line symbol options registered
    [ChartType.ColumnStacked]: { status: 'na', reason: 'not a line or area chart; lineSymbols option is not registered' },
    // single-series line; lineSymbols=false; wiki accessibility rule implies symbols on for multi-encoding
    // but wiki is silent on a mandatory on default for single-series line charts
    [ChartType.Line]: {
      status: 'open',
      optionKey: 'lineSymbols',
      current: false,
      notes: 'Wiki accessibility rule recommends symbols as a second encoding channel but does not prescribe a mandatory default for single-series line. lineSymbolShape=Circle, lineSymbolShowOn=FirstLast, lineSymbolStyle=Filled, lineSymbolSize=3.5 are secondary defaults with no direct wiki mandate.',
    },
    // multi-series line; lineSymbols=true; wiki says use symbols/patterns to add a second encoding channel
    // especially for multi-series charts where CVD distinguishability matters most
    [ChartType.LineMulti]: {
      status: 'asserted',
      optionKey: 'lineSymbols',
      target: true,
      rule: RULE_ACCESSIBILITY_MULTIPLE_ENCODING,
    },
    // single-series area; lineSymbols=false; same wiki gap as single-series line
    [ChartType.Area]: {
      status: 'open',
      optionKey: 'lineSymbols',
      current: false,
      notes: 'Wiki accessibility rule applies but is less explicit for single-series area charts. No wiki rule found prescribing a mandatory default. Secondary options (shape, showOn, style, size) have no direct wiki citation.',
    },
    // stacked area; lineSymbolOpts are NOT registered for area-stacked (it uses lineCrosshairOpts only)
    [ChartType.AreaStacked]: { status: 'na', reason: 'lineSymbols and related options are not registered for area-stacked; chart uses lineCrosshairOpts only' },
    // donut — polar chart; no line symbols
    [ChartType.Donut]: { status: 'na', reason: 'polar chart; lineSymbols option is not registered' },
    // pie — polar chart; no line symbols
    [ChartType.Pie]: { status: 'na', reason: 'polar chart; lineSymbols option is not registered' },
  },

  // =========================================================================
  // Concern: BarLayout
  // Primary verdict on 'barGap' (default String(DEFAULT_BAR_GAP) = '60').
  // barGapOpt is registered only for BarVertical and BarHorizontal; all other
  // chart types (including BarMulti, BarStacked, BarGrouped, ColumnStacked) do
  // not register barGapOpt → na for those.
  // Wiki: 30–50% spacing between bars. DEFAULT_BAR_GAP=60 maps to ~37.5% of the
  // total band width (60/(160) ≈ 0.375) — within the prescribed range → asserted.
  // Secondary bar options (barBackground, barSeparators, connectedColumns,
  // waterfall, edgePadding) default to false; wiki does not prescribe their defaults.
  // =========================================================================
  [Concern.BarLayout]: {
    // vertical bar; barGap='60' → ~37.5% spacing, within wiki's 30–50% range → asserted
    [ChartType.BarVertical]: {
      status: 'asserted',
      optionKey: 'barGap',
      target: '60',
      rule: RULE_BAR_SPACING,
    },
    // horizontal bar; barGap='60' → same reasoning → asserted
    [ChartType.BarHorizontal]: {
      status: 'asserted',
      optionKey: 'barGap',
      target: '60',
      rule: RULE_BAR_SPACING,
    },
    // multi-series bar; barGapOpt is not registered for this chart type
    [ChartType.BarMulti]: { status: 'na', reason: 'barGap option is not registered for bar-multi; group spacing is handled differently' },
    // stacked horizontal bar; barGapOpt is not registered (uses barHorizontalAxisOpts/barHorizontalOpts)
    [ChartType.BarStacked]: { status: 'na', reason: 'barGap option is not registered for bar-stacked; stacked bars share a fixed band' },
    // split bar; barGapOpt is not registered
    [ChartType.BarSplit]: { status: 'na', reason: 'barGap option is not registered for bar-split; each panel has its own fixed layout' },
    // grouped horizontal bars; barGapOpt is not registered
    [ChartType.BarGrouped]: { status: 'na', reason: 'barGap option is not registered for bar-grouped; within-group spacing is not user-configurable' },
    // stacked column; barGapOpt is not registered
    [ChartType.ColumnStacked]: { status: 'na', reason: 'barGap option is not registered for column-stacked; stacked columns share a fixed band' },
    // line charts — not bar charts; no barGap
    [ChartType.Line]: { status: 'na', reason: 'not a bar chart; barGap option is not registered' },
    [ChartType.LineMulti]: { status: 'na', reason: 'not a bar chart; barGap option is not registered' },
    [ChartType.Area]: { status: 'na', reason: 'not a bar chart; barGap option is not registered' },
    [ChartType.AreaStacked]: { status: 'na', reason: 'not a bar chart; barGap option is not registered' },
    [ChartType.Donut]: { status: 'na', reason: 'polar chart; barGap option is not registered' },
    [ChartType.Pie]: { status: 'na', reason: 'polar chart; barGap option is not registered' },
  },

  // =========================================================================
  // Concern: PieDonutLayout
  // Applies only to Pie and Donut. All other 11 chart types → na.
  // Primary verdict:
  //   Donut → 'showTotal' (default true via donutShowTotalOpt); wiki says "show
  //     a primary metric in the center" → asserted.
  //   Pie → 'displayAsPercentage' (default true via pieDisplayAsPercentageOpt);
  //     wiki says pie shows proportions → asserted.
  // Secondary options:
  //   sliceMax: donut=6 (sliceMaxOpt), pie=5 (pieSliceMaxOpt). Wiki says 5–6 slices max.
  //   showLabels/showValues: default true for both → asserted (wiki: direct labelling).
  //   displayAsPercentage: donut=false (open — wiki says donut can show absolute total).
  //   sliceGroupLabel: default 'Others' — no wiki prescription.
  // =========================================================================
  [Concern.PieDonutLayout]: {
    // vertical bar — not a pie/donut chart
    [ChartType.BarVertical]: { status: 'na', reason: 'not a pie or donut chart; pie/donut layout options do not apply' },
    [ChartType.BarHorizontal]: { status: 'na', reason: 'not a pie or donut chart; pie/donut layout options do not apply' },
    [ChartType.BarMulti]: { status: 'na', reason: 'not a pie or donut chart; pie/donut layout options do not apply' },
    [ChartType.BarStacked]: { status: 'na', reason: 'not a pie or donut chart; pie/donut layout options do not apply' },
    [ChartType.BarSplit]: { status: 'na', reason: 'not a pie or donut chart; pie/donut layout options do not apply' },
    [ChartType.BarGrouped]: { status: 'na', reason: 'not a pie or donut chart; pie/donut layout options do not apply' },
    [ChartType.ColumnStacked]: { status: 'na', reason: 'not a pie or donut chart; pie/donut layout options do not apply' },
    [ChartType.Line]: { status: 'na', reason: 'not a pie or donut chart; pie/donut layout options do not apply' },
    [ChartType.LineMulti]: { status: 'na', reason: 'not a pie or donut chart; pie/donut layout options do not apply' },
    [ChartType.Area]: { status: 'na', reason: 'not a pie or donut chart; pie/donut layout options do not apply' },
    [ChartType.AreaStacked]: { status: 'na', reason: 'not a pie or donut chart; pie/donut layout options do not apply' },
    // donut; showTotal=true via donutShowTotalOpt; wiki says "show total or primary metric in center" → asserted
    // displayAsPercentage=false (donutArcOpts uses base displayAsPercentageOpt); wiki does not require % for donut
    // (donut typically shows a center total which is absolute); sliceMax=6 is within wiki's 5–6 range
    [ChartType.Donut]: {
      status: 'asserted',
      optionKey: 'showTotal',
      target: true,
      rule: RULE_DONUT_CENTER,
    },
    // pie; displayAsPercentage=true via pieDisplayAsPercentageOpt; wiki says pie shows proportions → asserted
    // sliceMax=5 via pieSliceMaxOpt; wiki says ~5–6 slices max, 5 is within range → asserted as primary
    // showLabels=true, showValues=true are secondary; wiki says "label each slice directly"
    [ChartType.Pie]: {
      status: 'asserted',
      optionKey: 'displayAsPercentage',
      target: true,
      rule: RULE_PIE_PERCENTAGE,
    },
  },

  // =========================================================================
  // Concern: Stacking
  // Applies to ColumnStacked (stackModeOpt), BarStacked (stackModeOpt),
  // AreaStacked (stacked + stackPercent). All others → na.
  // Wiki: describes both absolute and normalized variants but does NOT prescribe
  // which is the default. stackMode=Normal (absolute) is the current default for
  // column/bar-stacked. stacked=true (areas are stacked) and stackPercent=false
  // (not normalized) are the area-stacked defaults.
  // =========================================================================
  [Concern.Stacking]: {
    [ChartType.BarVertical]: { status: 'na', reason: 'not a stacked chart type; stacking options are not registered' },
    [ChartType.BarHorizontal]: { status: 'na', reason: 'not a stacked chart type; stacking options are not registered' },
    [ChartType.BarMulti]: { status: 'na', reason: 'not a stacked chart type; stacking options are not registered' },
    // stacked horizontal bar; stackMode=StackMode.Normal (absolute); wiki describes both variants
    // without prescribing a default → open; Normal is a defensible default
    [ChartType.BarStacked]: {
      status: 'open',
      optionKey: 'stackMode',
      current: StackMode.Normal,
      notes: 'Wiki describes absolute and 100% normalized stacking as both valid variants for stacked bar charts without naming a default. StackMode.Normal (absolute values) is the current default; it is appropriate when totals matter but the wiki does not explicitly prescribe it over Percent.',
    },
    [ChartType.BarSplit]: { status: 'na', reason: 'not a stacked chart type; stacking options are not registered' },
    [ChartType.BarGrouped]: { status: 'na', reason: 'not a stacked chart type; stacking options are not registered' },
    // stacked column; stackMode=StackMode.Normal; same wiki gap as BarStacked → open
    [ChartType.ColumnStacked]: {
      status: 'open',
      optionKey: 'stackMode',
      current: StackMode.Normal,
      notes: 'Wiki describes absolute and 100% normalized stacking as both valid variants for column-stacked charts without naming a default. StackMode.Normal is the current default; defensible but not wiki-mandated.',
    },
    [ChartType.Line]: { status: 'na', reason: 'not a stacked chart type; stacking options are not registered' },
    [ChartType.LineMulti]: { status: 'na', reason: 'not a stacked chart type; stacking options are not registered' },
    [ChartType.Area]: { status: 'na', reason: 'not a stacked chart type; stacking options are not registered' },
    // stacked area; stacked=true (stacking is the chart's defining characteristic → asserted);
    // stackPercent=false (absolute default; wiki does not prescribe normalized as default → open)
    [ChartType.AreaStacked]: {
      status: 'asserted',
      optionKey: 'stacked',
      target: true,
      rule: RULE_STACKING_VARIANTS,
    },
    [ChartType.Donut]: { status: 'na', reason: 'polar chart; stacking options are not registered' },
    [ChartType.Pie]: { status: 'na', reason: 'polar chart; stacking options are not registered' },
  },

  // =========================================================================
  // Concern: Sort
  // Primary verdict on 'sortMode' (default SortMode.None) where registered, or
  // 'areaSortMode' (default SortDirection.None) for area-stacked.
  // Charts with sortModeOpt: BarMulti, ColumnStacked, BarStacked, BarSplit,
  //   BarGrouped, LineMulti.
  // Charts with areaSortModeOpt: AreaStacked.
  // No sort option registered for: BarVertical, BarHorizontal, Line, Area,
  //   Donut, Pie → na.
  // Wiki: bar should sort descending by value unless natural category order;
  //       wiki is silent on sort for multi-series/stacked/split/line charts.
  // =========================================================================
  [Concern.Sort]: {
    // vertical bar — sortModeOpt is not registered for this chart type
    [ChartType.BarVertical]: { status: 'na', reason: 'sortMode option is not registered for bar-vertical; single-series sort is handled by input data order' },
    // horizontal bar — sortModeOpt is not registered
    [ChartType.BarHorizontal]: { status: 'na', reason: 'sortMode option is not registered for bar-horizontal; single-series sort is handled by input data order' },
    // multi-series bar; sortMode=SortMode.None; wiki says sort bars descending unless natural order
    [ChartType.BarMulti]: {
      status: 'todo',
      optionKey: 'sortMode',
      current: SortMode.None,
      target: SortMode.Total,
      rule: RULE_SORT_DESCENDING,
      notes: 'Wiki says sort bars by value (descending) unless there is a natural category order. SortMode.None preserves input order which may be non-semantic. SortMode.Total (by group total descending) is the closest available mode matching the wiki prescription. Caveat: temporal data has a natural order that should override this; chart authors must be able to opt out.',
    },
    // stacked horizontal bar; sortMode=SortMode.None; wiki says sort horizontal bars by value
    // but also prescribes consistent segment ordering within stacks — sort by total conflicts
    // with consistent ordering requirement → open
    [ChartType.BarStacked]: {
      status: 'open',
      optionKey: 'sortMode',
      current: SortMode.None,
      notes: 'Wiki says horizontal bars should sort by value (largest at top) but also mandates consistent segment ordering. Sorting by total while keeping segment order consistent is technically feasible but the interaction is not prescribed. Wiki does not explicitly state SortMode.None vs SortMode.Total for stacked variants.',
    },
    // split bar; sortMode=SortMode.None; wiki is silent on split bar sort → open
    [ChartType.BarSplit]: {
      status: 'open',
      optionKey: 'sortMode',
      current: SortMode.None,
      notes: 'Wiki does not cover split bar charts. SortMode.None (input order) is the conservative default. No wiki rule found prescribing a sort default for split bar panels.',
    },
    // grouped horizontal bars; sortMode=SortMode.None; wiki says sort horizontal bars by value → todo
    [ChartType.BarGrouped]: {
      status: 'todo',
      optionKey: 'sortMode',
      current: SortMode.None,
      target: SortMode.Total,
      rule: RULE_HANDBOOK_BAR_HORIZONTAL,
      notes: 'Wiki says sort horizontal bars by value (largest at top). SortMode.Total sorts categories by their total, which corresponds to the wiki prescription for grouped horizontal bar rankings.',
    },
    // stacked column; sortMode=SortMode.None; wiki prescribes consistent segment ordering
    // for stacked charts rather than sort by value → open
    [ChartType.ColumnStacked]: {
      status: 'open',
      optionKey: 'sortMode',
      current: SortMode.None,
      notes: 'Wiki says use consistent segment ordering across all bars but does not prescribe a category sort for column-stacked. SortMode.None (input order) is defensible. No explicit wiki rule prescribing a sort default for stacked column categories.',
    },
    // single-series line — sortModeOpt is not registered for this chart type
    [ChartType.Line]: { status: 'na', reason: 'sortMode option is not registered for line; time-series order is defined by the data' },
    // multi-series line; sortMode=SortMode.None; wiki is silent on line chart sort → open
    [ChartType.LineMulti]: {
      status: 'open',
      optionKey: 'sortMode',
      current: SortMode.None,
      notes: 'Wiki does not prescribe a sort default for multi-series line charts; time-series data has a natural temporal order. SortMode.None (input order) is correct for temporal data. No wiki rule found.',
    },
    // single-series area — sortModeOpt is not registered
    [ChartType.Area]: { status: 'na', reason: 'sortMode option is not registered for area; time-series order is defined by the data' },
    // stacked area; areaSortMode=SortDirection.None; wiki says most important series at bottom
    // but does not prescribe a sort direction for re-ordering series → open
    [ChartType.AreaStacked]: {
      status: 'open',
      optionKey: 'areaSortMode',
      current: SortDirection.None,
      notes: 'Wiki says position the most important series at the bottom (stable baseline) for stacked area, but this is an authoring guideline rather than a chart default. SortDirection.None (input order preserved) lets authors explicitly place the key series first. No wiki rule prescribes an automatic sort direction default.',
    },
    // donut — sortMode is not registered; slice ordering is handled by PieDonutLayout
    [ChartType.Donut]: { status: 'na', reason: 'sortMode option is not registered for donut; slice ordering is part of PieDonutLayout concern' },
    // pie — sortMode is not registered; slice ordering is handled by PieDonutLayout
    [ChartType.Pie]: { status: 'na', reason: 'sortMode option is not registered for pie; slice ordering is part of PieDonutLayout concern' },
  },

  // =========================================================================
  // Concern: RendererConstants
  // Module-local DEFAULT_COLOR / DEFAULT_COLORS constants in each chart-type
  // file. These are not registered option keys — they are renderer-internal
  // fallbacks used when no colors option is supplied at call time.
  //
  // All 12 colour-bearing chart types share the same Tableau-10 derived
  // palette (#4e79a7 … #ff9da7). This palette is CVD-safe (blue–orange lead,
  // varying lightness, no rainbow), satisfying the wiki's key-rules citation.
  //
  // Single-series charts (Line, Area) carry a scalar DEFAULT_COLOR equal to
  // the first palette entry. BarVertical and BarHorizontal carry a
  // single-element array DEFAULT_COLORS for API consistency.
  //
  // Pie has no module-local default-color constant; it delegates colour
  // assignment to the shared arc palette mechanism and is therefore N/A.
  // =========================================================================
  [Concern.RendererConstants]: {
    [ChartType.Line]: {
      status: 'asserted',
      kind: 'rendererConstant',
      importPath: '../types/line/line',
      exportName: 'DEFAULT_COLOR',
      target: '#4e79a7',
      rule: RULE_CVD_SAFE_PALETTE,
    },
    [ChartType.Area]: {
      status: 'asserted',
      kind: 'rendererConstant',
      importPath: '../types/area/area',
      exportName: 'DEFAULT_COLOR',
      target: '#4e79a7',
      rule: RULE_CVD_SAFE_PALETTE,
    },
    [ChartType.BarVertical]: {
      status: 'asserted',
      kind: 'rendererConstant',
      importPath: '../types/bar-vertical/bar-vertical',
      exportName: 'DEFAULT_COLORS',
      target: ['#4e79a7'],
      rule: RULE_CVD_SAFE_PALETTE,
    },
    [ChartType.BarHorizontal]: {
      status: 'asserted',
      kind: 'rendererConstant',
      importPath: '../types/bar-horizontal/bar-horizontal',
      exportName: 'DEFAULT_COLORS',
      target: ['#4e79a7'],
      rule: RULE_CVD_SAFE_PALETTE,
    },
    [ChartType.BarMulti]: {
      status: 'asserted',
      kind: 'rendererConstant',
      importPath: '../types/bar-multi/bar-multi',
      exportName: 'DEFAULT_COLORS',
      target: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7'],
      rule: RULE_CVD_SAFE_PALETTE,
    },
    [ChartType.BarGrouped]: {
      status: 'asserted',
      kind: 'rendererConstant',
      importPath: '../types/bar-grouped/bar-grouped',
      exportName: 'DEFAULT_COLORS',
      target: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7'],
      rule: RULE_CVD_SAFE_PALETTE,
    },
    [ChartType.BarSplit]: {
      status: 'asserted',
      kind: 'rendererConstant',
      importPath: '../types/bar-split/bar-split',
      exportName: 'DEFAULT_COLORS',
      target: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7'],
      rule: RULE_CVD_SAFE_PALETTE,
    },
    [ChartType.BarStacked]: {
      status: 'asserted',
      kind: 'rendererConstant',
      importPath: '../types/bar-stacked/bar-stacked',
      exportName: 'DEFAULT_COLORS',
      target: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7'],
      rule: RULE_CVD_SAFE_PALETTE,
    },
    [ChartType.ColumnStacked]: {
      status: 'asserted',
      kind: 'rendererConstant',
      importPath: '../types/column-stacked/column-stacked',
      exportName: 'DEFAULT_COLORS',
      target: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7'],
      rule: RULE_CVD_SAFE_PALETTE,
    },
    [ChartType.LineMulti]: {
      status: 'asserted',
      kind: 'rendererConstant',
      importPath: '../types/line-multi/line-multi',
      exportName: 'DEFAULT_COLORS',
      target: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7'],
      rule: RULE_CVD_SAFE_PALETTE,
    },
    [ChartType.AreaStacked]: {
      status: 'asserted',
      kind: 'rendererConstant',
      importPath: '../types/area-stacked/area-stacked',
      exportName: 'DEFAULT_COLORS',
      target: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7'],
      rule: RULE_CVD_SAFE_PALETTE,
    },
    [ChartType.Donut]: {
      status: 'asserted',
      kind: 'rendererConstant',
      importPath: '../types/donut/donut',
      exportName: 'DEFAULT_COLORS',
      target: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7'],
      rule: RULE_CVD_SAFE_PALETTE,
    },
    [ChartType.Pie]: {
      status: 'na',
      reason: 'no module-local default-color constant; pie delegates color assignment to the shared arc palette mechanism',
    },
  },
}
