// ---------------------------------------------------------------------------
// Central enum definitions for @blueprint-chart/ui
// ---------------------------------------------------------------------------

export enum IconSize {
  Xxs = '2xs',
  Xs = 'xs',
  Sm = 'sm',
  Md = 'md',
  Lg = 'lg',
  Xl = 'xl',
  Xxl = '2xl',
}

// Chart type enum — mirrors @blueprint-chart/lib ChartType but declared here
// because the ui package is standalone and does not depend on lib.
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
}
