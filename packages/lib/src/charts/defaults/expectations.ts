import { ChartType, DirectLabelMode, GridStyle, LabelRotation, ScaleType } from '../../enums'
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
    // vertical bar; verticalScaleType=Linear (asserted); verticalRangeMin has no default → todo (must be 0)
    [ChartType.BarVertical]: {
      status: 'todo',
      optionKey: 'verticalRangeMin',
      current: undefined,
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
      notes: 'Wiki mandates bar charts start at zero ("the bar length encodes the value"). verticalRangeMin has no default (placeholder auto) — must be set to 0. verticalScaleType=ScaleType.Linear is correctly asserted by the scale option.',
    },
    // horizontal bar; horizontalScaleType=Linear (asserted); horizontalRangeMin has no default → todo (must be 0)
    [ChartType.BarHorizontal]: {
      status: 'todo',
      optionKey: 'horizontalRangeMin',
      current: undefined,
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
      notes: 'Wiki mandates horizontal bar charts start at zero. horizontalRangeMin has no default (placeholder auto) — must be set to 0. horizontalScaleType=ScaleType.Linear is correctly registered.',
    },
    // multi-series vertical bar; same as barVertical → todo
    [ChartType.BarMulti]: {
      status: 'todo',
      optionKey: 'verticalRangeMin',
      current: undefined,
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
      notes: 'Same as barVertical: wiki mandates zero-based axis for bar charts. verticalRangeMin has no default.',
    },
    // stacked horizontal bar; horizontalRangeMin has no default → todo (must be 0)
    [ChartType.BarStacked]: {
      status: 'todo',
      optionKey: 'horizontalRangeMin',
      current: undefined,
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
      notes: 'Wiki mandates bar charts start at zero ("start axes at zero for area / bar charts"). horizontalRangeMin has no default — must be 0.',
    },
    // split bar; horizontalRangeMin has no default → todo (must be 0)
    [ChartType.BarSplit]: {
      status: 'todo',
      optionKey: 'horizontalRangeMin',
      current: undefined,
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
      notes: 'Wiki mandates bar charts start at zero. horizontalRangeMin has no default. Wiki does not cover split bar explicitly but the zero-baseline rule applies to the bar-encoding family.',
    },
    // grouped horizontal bars; horizontalRangeMin has no default → todo (must be 0)
    [ChartType.BarGrouped]: {
      status: 'todo',
      optionKey: 'horizontalRangeMin',
      current: undefined,
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
      notes: 'Same as BarStacked: wiki mandates zero-based axis for bar charts. horizontalRangeMin has no default.',
    },
    // stacked column; verticalRangeMin has no default → todo (must be 0)
    [ChartType.ColumnStacked]: {
      status: 'todo',
      optionKey: 'verticalRangeMin',
      current: undefined,
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
      notes: 'Wiki mandates stacked bar/column charts start at zero. verticalRangeMin has no default.',
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
    // single-series area; verticalRangeMin has no default → todo (must be 0)
    [ChartType.Area]: {
      status: 'todo',
      optionKey: 'verticalRangeMin',
      current: undefined,
      target: 0,
      rule: RULE_HANDBOOK_AREA,
      notes: 'Wiki says "the y-axis must start at zero — the filled area encodes magnitude". verticalRangeMin has no default (placeholder auto) — must be set to 0.',
    },
    // stacked area; verticalRangeMin has no default → todo (must be 0)
    [ChartType.AreaStacked]: {
      status: 'todo',
      optionKey: 'verticalRangeMin',
      current: undefined,
      target: 0,
      rule: RULE_AXIS_ZERO_BAR,
      notes: 'Wiki mandates area charts start at zero ("start axes at zero for area / bar charts"). verticalRangeMin has no default.',
    },
    // donut; polar chart — no scale range concern
    [ChartType.Donut]: { status: 'na', reason: 'donut is a polar chart with no Cartesian axes; scale range concern does not apply' },
    // pie; polar chart — no scale range concern
    [ChartType.Pie]: { status: 'na', reason: 'pie is a polar chart with no Cartesian axes; scale range concern does not apply' },
  },
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
