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
const RULE_CROSSHAIR_PATTERNS = 'wiki/concepts/tooltips-and-interaction.md § Crosshair patterns'
const RULE_TOOLTIPS_HIDDEN = 'wiki/concepts/tooltips-and-interaction.md § Tooltip content'

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
      status: 'todo',
      optionKey: 'crosshair',
      current: false,
      target: true,
      rule: RULE_CROSSHAIR_PATTERNS,
      notes: 'Wiki says vertical crosshair is standard for time-series line charts and is often combined with a tooltip. crosshairDirection is overridden to Vertical via lineCrosshairDirectionOpt — direction is already correct. crosshairStyle=Dashed and crosshairColor=#999 match the wiki prescription for subtle/dashed/grey styling. The on/off default (false) does not match the wiki implication that crosshair should be active for time-series line.',
    },
    // multi-series line; same wiki rule applies — vertical crosshair standard for line charts
    [ChartType.LineMulti]: {
      status: 'todo',
      optionKey: 'crosshair',
      current: false,
      target: true,
      rule: RULE_CROSSHAIR_PATTERNS,
      notes: 'Same as line: wiki prescribes vertical crosshair for time-series line charts. crosshairDirection=Vertical via lineCrosshairDirectionOpt is already correct. crosshair=false does not match the wiki prescription.',
    },
    // single-series area; wiki says vertical crosshair for time-series area charts
    [ChartType.Area]: {
      status: 'todo',
      optionKey: 'crosshair',
      current: false,
      target: true,
      rule: RULE_CROSSHAIR_PATTERNS,
      notes: 'Wiki says vertical crosshair is standard for time-series line/area. crosshairDirection=Vertical via lineCrosshairDirectionOpt is already correct. crosshair=false does not match the wiki prescription for area charts.',
    },
    // stacked area; same as area — wiki prescribes vertical crosshair for time-series area
    [ChartType.AreaStacked]: {
      status: 'todo',
      optionKey: 'crosshair',
      current: false,
      target: true,
      rule: RULE_CROSSHAIR_PATTERNS,
      notes: 'Same as area: wiki prescribes vertical crosshair for stacked area time-series charts. crosshairDirection=Vertical via lineCrosshairOpts is already correct. crosshair=false does not match the wiki prescription.',
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
  [Concern.LineInterpolation]: {},
  [Concern.LineSymbols]: {},
  [Concern.BarLayout]: {},
  [Concern.PieDonutLayout]: {},
  [Concern.Stacking]: {},
  [Concern.Sort]: {},
  [Concern.RendererConstants]: {},
}
