export const CHART_CSS = `
/* Blueprint Chart — Runtime Embed Styles
   CSS custom properties with baked-in defaults for standalone iframe usage. */

.bc-frame {
  --bc-frame-font-family: system-ui, -apple-system, sans-serif;
  --bc-frame-padding: 0;
  --bc-text-color: #333;
  font-family: var(--bc-frame-font-family);
}

.bc-frame-header {
  padding: var(--bc-frame-padding) var(--bc-frame-padding) 0;
  background: var(--bc-frame-header-bg, transparent);
  border-bottom: var(--bc-frame-header-border-bottom, none);
  margin-bottom: var(--bc-frame-header-margin-bottom, 0);
}

.bc-frame-body {
  padding: 0 var(--bc-frame-padding);
}

.bc-frame-title {
  --bc-frame-title-color: var(--bc-text-color, #333);
  --bc-frame-title-font-size: 1.25rem;
  color: var(--bc-frame-title-color);
  font-size: var(--bc-frame-title-font-size);
  font-weight: bold;
  margin: 0;
}

.bc-frame-description {
  --bc-frame-description-color: var(--bc-text-color, #555);
  --bc-frame-description-font-size: 0.875rem;
  color: var(--bc-frame-description-color);
  font-size: var(--bc-frame-description-font-size);
  margin: 0.25rem 0 0;
}

.bc-frame-footer {
  margin-top: 0.5rem;
  gap: 0.25rem 1rem;
  padding: var(--bc-frame-footer-padding-top, 0) var(--bc-frame-padding) var(--bc-frame-padding);
  background: var(--bc-frame-footer-bg, transparent);
  border-top: var(--bc-frame-footer-border-top, none);
}

.bc-frame-footer-left {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
}

.bc-frame-footer-left > :not(:first-child)::before {
  content: "\\00B7";
  margin-right: 0.5rem;
  color: var(--bc-text-color, #888);
}

.bc-frame-footer-right {
  display: flex;
  align-items: center;
}

.bc-frame-note {
  --bc-frame-note-color: var(--bc-text-color, #888);
  --bc-frame-note-font-size: 0.75rem;
  font-style: italic;
  color: var(--bc-frame-note-color);
  font-size: var(--bc-frame-note-font-size);
  margin: 0;
  padding: 0 var(--bc-frame-padding);
}

.bc-frame-byline,
.bc-frame-source {
  --bc-frame-meta-color: var(--bc-text-color, #888);
  --bc-frame-meta-font-size: 0.75rem;
  color: var(--bc-frame-meta-color);
  font-size: var(--bc-frame-meta-font-size);
}

.bc-frame-credit {
  --bc-frame-credit-color: var(--bc-text-color, #666);
  --bc-frame-credit-font-size: 0.75rem;
  color: var(--bc-frame-credit-color);
  font-size: var(--bc-frame-credit-font-size);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.bc-frame-source-link {
  color: inherit;
  text-decoration: underline;
}

.bc-axis .domain {
  stroke: var(--bc-axis-color, #333);
}

.bc-axis .tick text {
  fill: var(--bc-axis-color, #333);
  font-size: 10px;
}

.bc-axis .tick line {
  stroke: var(--bc-axis-color, #333);
}

.bc-grid-line {
  stroke: var(--bc-grid-color, #e0e0e0);
  stroke-width: 1;
}

.bc-zero-baseline {
  stroke: #666;
  stroke-width: 1;
}

.bc-bar {
  /* fill is set via D3 .attr() from data-bound colors — do not override */
}

.bc-line {
  fill: none;
  stroke-width: 2;
}

.bc-value-label {
  font-size: 11px;
  /* fill is set via D3 .attr() — do not override */
}

.bc-direct-label {
  font-size: 12px;
  font-weight: 600;
}

.bc-tooltip {
  position: absolute;
  pointer-events: none;
  background: var(--bc-tooltip-bg, #fff);
  color: var(--bc-tooltip-color, #212529);
  border: 1px solid var(--bc-tooltip-border-color, #dee2e6);
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  z-index: 9999;
  display: none;
}

.bc-crosshair {
  stroke: #999;
  stroke-width: 1;
  pointer-events: none;
}

.bc-arc-label-line {
  fill: none;
  stroke: #999;
  stroke-width: 1;
}

.bc-theme-blueprint-framed {
  --bc-frame-header-border-bottom: 1px solid #e0e0e0;
  --bc-frame-header-margin-bottom: 0.5rem;
  --bc-frame-footer-bg: #f8f8f8;
  --bc-frame-footer-border-top: 1px solid #e0e0e0;
  --bc-frame-footer-padding-top: 0.625rem;
}

.blueprint-chart-error {
  color: red;
  padding: 1em;
  border: 1px solid red;
}

body {
  margin: 0;
  overflow: hidden;
}
`
