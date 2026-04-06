// ---------------------------------------------------------------------------
// Central enum definitions for @blueprint-chart/editor
// ---------------------------------------------------------------------------

export enum TransformType {
  Sort = 'sort',
  Filter = 'filter',
  HideColumns = 'hide-columns',
  Transpose = 'transpose',
  Parse = 'parse',
  Rename = 'rename',
  GroupBy = 'group-by',
  Computed = 'computed',
}

export enum FilterCondition {
  Equals = 'equals',
  NotEquals = 'not-equals',
  Contains = 'contains',
  GreaterThan = 'greater-than',
  LessThan = 'less-than',
}

export enum ParseOperationCategory {
  Type = 'type',
  String = 'string',
  Numeric = 'numeric',
  Date = 'date',
}
